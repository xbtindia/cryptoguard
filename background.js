
// CryptoGuard Background Service Worker v1.2
// Safe Mode Timer: default allow all, timer enables blocking, auto-disables after

const DYNAMIC_RULE_OFFSET = 10000;
const BYPASS_RULE_ID = 999999;

// ─── Init ───

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      enabled: false,              // Default: allow all sites
      blockedCount: 0,
      userAllowedDomains: [],
      tempSafeModeUntil: 0,        // Timer expiry timestamp
      tempSafeModeDuration: 0,     // Timer duration in minutes
      protectionLevel: 'standard'
    });
    // Ensure bypass rule is active so all sites load by default
    disableProtection();
    console.log('[CryptoGuard] Installed. Default: all sites allowed.');
  }
});

// ─── Block counter (desktop only, guarded) ───

if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    if (info.rule && info.rule.ruleId === 1) {
      chrome.storage.local.get(['blockedCount'], (data) => {
        const newCount = (data.blockedCount || 0) + 1;
        chrome.storage.local.set({ blockedCount: newCount });
      });
    }
  });
}

// ─── Message Handler ───

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    // Sender validation for sensitive actions
    const isInternal = sender.id === chrome.runtime.id;
    const sensitiveActions = ['addDomain','removeDomain','toggleProtection','startSafeMode','cancelSafeMode'];

    if (!isInternal && sensitiveActions.includes(request.action)) {
      sendResponse({ success: false, error: 'Unauthorized sender' });
      return;
    }

    if (request.action === 'getStatus') {
      const data = await chrome.storage.local.get([
        'enabled', 'blockedCount', 'userAllowedDomains', 'tempSafeModeUntil', 'tempSafeModeDuration'
      ]);
      sendResponse(data);
    }

    else if (request.action === 'addDomain') {
      const domain = normalizeDomain(request.domain);
      if (!domain) {
        sendResponse({ success: false, error: 'Invalid domain' });
        return;
      }

      const data = await chrome.storage.local.get(['userAllowedDomains']);
      const list = data.userAllowedDomains || [];

      if (list.includes(domain)) {
        sendResponse({ success: false, error: 'Domain already allowed' });
        return;
      }

      list.push(domain);
      await chrome.storage.local.set({ userAllowedDomains: list });
      await addDynamicAllowRule(domain, list.length);
      sendResponse({ success: true, domain: domain });
    }

    else if (request.action === 'removeDomain') {
      const domain = request.domain;
      const data = await chrome.storage.local.get(['userAllowedDomains']);
      const list = (data.userAllowedDomains || []).filter(d => d !== domain);
      await chrome.storage.local.set({ userAllowedDomains: list });
      await rebuildDynamicRules(list);
      sendResponse({ success: true });
    }

    else if (request.action === 'toggleProtection') {
      const data = await chrome.storage.local.get(['enabled']);
      const newState = !data.enabled;
      await chrome.storage.local.set({ enabled: newState, tempSafeModeUntil: 0, tempSafeModeDuration: 0 });

      if (newState) {
        await enableProtection();
      } else {
        await disableProtection();
      }
      sendResponse({ enabled: newState });
    }

    else if (request.action === 'startSafeMode') {
      const minutes = Math.min(Math.max(parseInt(request.minutes) || 15, 1), 480);
      const until = Date.now() + (minutes * 60 * 1000);
      await chrome.storage.local.set({ 
        tempSafeModeUntil: until, 
        tempSafeModeDuration: minutes,
        enabled: true 
      });
      await enableProtection();
      sendResponse({ until: until, minutes: minutes });
    }

    else if (request.action === 'cancelSafeMode') {
      await chrome.storage.local.set({ 
        tempSafeModeUntil: 0, 
        tempSafeModeDuration: 0,
        enabled: false 
      });
      await disableProtection();
      sendResponse({ success: true });
    }

    else if (request.action === 'resetCounter') {
      await chrome.storage.local.set({ blockedCount: 0 });
      sendResponse({ success: true });
    }

    else if (request.action === 'reportBlocked') {
      const data = await chrome.storage.local.get(['blockedCount']);
      const newCount = (data.blockedCount || 0) + 1;
      await chrome.storage.local.set({ blockedCount: newCount });
      sendResponse({ success: true, count: newCount });
    }
  })();

  return true;
});

// ─── Helpers ───

function normalizeDomain(input) {
  try {
    let url = input.trim().toLowerCase();
    if (!url.startsWith('http')) url = 'https://' + url;
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

async function addDynamicAllowRule(domain, index) {
  const ruleId = DYNAMIC_RULE_OFFSET + index;
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: ruleId,
      priority: 100,
      action: { type: 'allowAllRequests' },
      condition: {
        requestDomains: [domain],
        resourceTypes: ['main_frame']
      }
    }],
    removeRuleIds: [ruleId]
  });
}

async function rebuildDynamicRules(domains) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing
    .filter(r => r.id >= DYNAMIC_RULE_OFFSET && r.id !== BYPASS_RULE_ID)
    .map(r => r.id);

  const newRules = domains.map((domain, idx) => ({
    id: DYNAMIC_RULE_OFFSET + idx + 1,
    priority: 100,
    action: { type: 'allowAllRequests' },
    condition: {
      requestDomains: [domain],
      resourceTypes: ['main_frame']
    }
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: newRules,
    removeRuleIds: removeIds
  });
}

// enableProtection = remove bypass rule -> block all except allowlist
async function enableProtection() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const unblockRule = existing.find(r => r.id === BYPASS_RULE_ID);
  if (unblockRule) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [],
      removeRuleIds: [BYPASS_RULE_ID]
    });
  }
}

// disableProtection = add bypass rule -> allow all sites
async function disableProtection() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: BYPASS_RULE_ID,
      priority: 999,
      action: { type: 'allowAllRequests' },
      condition: {
        urlFilter: '*',
        resourceTypes: ['main_frame']
      }
    }],
    removeRuleIds: [BYPASS_RULE_ID]
  });
}

// ─── Timer expiry checker ───

setInterval(async () => {
  const data = await chrome.storage.local.get(['tempSafeModeUntil', 'enabled']);
  if (data.tempSafeModeUntil && Date.now() >= data.tempSafeModeUntil && data.enabled) {
    await chrome.storage.local.set({ 
      tempSafeModeUntil: 0, 
      tempSafeModeDuration: 0,
      enabled: false 
    });
    await disableProtection();
    console.log('[CryptoGuard] Safe Mode timer expired. All sites allowed.');
  }
}, 10000); // Check every 10 seconds
