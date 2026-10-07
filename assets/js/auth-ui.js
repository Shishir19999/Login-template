/*
 * Complete demo auth flow shared by both login designs.
 * Views: sign in, register (with strength meter), forgot password, signed-in.
 * Everything is client-side (localStorage / sessionStorage). Seeded account is stored only as a SHA-256 hash.
 */
(function () {
  'use strict';
  var root = document.getElementById('auth-root');
  if (!root) return;
  var variant = root.getAttribute('data-variant') || 'simple';
  var floating = variant === 'nav';

  var SEED = { name: 'Demo User', email: 'demo@example.com', hash: '4a4418073b00346a15adaf97a20d6a0e3a69fa425f37a0dc25d10d04f2e0dfc4' };
  var USERS_KEY = 'lt.users', SESSION_KEY = 'lt.session', REMEMBER_KEY = 'lt.rememberedEmail';
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var ICON = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    eye: '<svg class="i-eye" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg class="i-eye-off" viewBox="0 0 24 24" aria-hidden="true" hidden><path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.1-5.9M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a18.6 18.6 0 0 1-2.2 3.2M1 1l22 22"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.3 4.3 0 0 1-1.9 2.8v2.3h3c1.8-1.6 2.9-4 2.9-6.8z" fill="#4285f4" stroke="none"/><path d="M12 21c2.5 0 4.6-.8 6.1-2.2l-3-2.3c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3.8v2.4A9 9 0 0 0 12 21z" fill="#34a853" stroke="none"/><path d="M6.9 13.6a5.4 5.4 0 0 1 0-3.4V7.8H3.8a9 9 0 0 0 0 8.2z" fill="#fbbc05" stroke="none"/><path d="M12 6.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9 9 0 0 0 3.8 7.8l3.1 2.4C7.6 8.2 9.6 6.6 12 6.6z" fill="#ea4335" stroke="none"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.8 2.8 5.6 3.2 5.6 3.2a5 5 0 0 0-.1 3.8A5.4 5.4 0 0 0 4 10.8c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-.9 2.6V22"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  function field(o) {
    var id = o.id;
    var type = o.type || 'text';
    var ph = floating ? ' ' : (o.placeholder || '');
    var icon = '<span class="lead-icon">' + (ICON[o.icon] || '') + '</span>';
    var toggle = o.toggle ? '<button type="button" class="input-action" data-toggle-for="' + id + '" aria-label="Show password" aria-pressed="false">' + ICON.eye + ICON.eyeOff + '</button>' : '';
    var extra = o.extra || '';
    return '<div class="field">' +
      '<div class="input-wrap">' + icon +
      '<input class="input" id="' + id + '" name="' + (o.name || id) + '" type="' + type + '" placeholder="' + ph + '" autocomplete="' + (o.autocomplete || 'off') + '"' + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + ' required aria-describedby="' + id + '-err' + (o.describedby ? ' ' + o.describedby : '') + '">' +
      '<label for="' + id + '">' + o.label + '</label>' + toggle + '</div>' + extra +
      '<p class="field-error" id="' + id + '-err"></p></div>';
  }

  var social = '<div class="divider"><span>or continue with</span></div>' +
    '<div class="social" role="group" aria-label="Social sign in (visual only)">' +
    ['google:Google', 'github:GitHub', 'facebook:Facebook'].map(function (s) {
      var p = s.split(':');
      return '<button type="button" class="social-btn" data-social="' + p[1] + '" aria-label="Continue with ' + p[1] + '">' + ICON[p[0]] + '<span>' + p[1] + '</span></button>';
    }).join('') + '</div>';

  root.innerHTML =
    '<section data-view="login" aria-labelledby="t-login">' +
      '<h1 id="t-login">Sign in</h1><p class="sub">Welcome back. Enter your details to continue.</p>' +
      '<div class="alert" id="login-alert" role="alert" hidden></div>' +
      '<form id="login-form" novalidate>' +
        field({ id: 'login-email', label: 'Email', type: 'email', icon: 'mail', placeholder: 'Email', autocomplete: 'username', inputmode: 'email' }) +
        field({ id: 'login-pass', label: 'Password', type: 'password', icon: 'lock', placeholder: 'Password', autocomplete: 'current-password', toggle: true }) +
        '<div class="row"><label class="check"><input type="checkbox" id="login-remember"> Remember me</label><a href="#forgot" data-go="forgot">Forgot password?</a></div>' +
        '<button class="btn btn-block" type="submit" id="login-btn">Sign in</button>' +
      '</form>' + social +
      '<p class="switch">New here? <a href="#register" data-go="register">Create an account</a></p>' +
      '<p class="demo-hint">Demo account: <code>demo@example.com</code> / <code>Demo@1234</code> <button type="button" class="link-btn" id="fill-demo">Fill it in</button></p>' +
    '</section>' +

    '<section data-view="register" aria-labelledby="t-reg" hidden>' +
      '<h1 id="t-reg">Create account</h1><p class="sub">It takes less than a minute.</p>' +
      '<form id="register-form" novalidate>' +
        field({ id: 'reg-name', label: 'Full name', icon: 'user', placeholder: 'Full name', autocomplete: 'name' }) +
        field({ id: 'reg-email', label: 'Email', type: 'email', icon: 'mail', placeholder: 'Email', autocomplete: 'email', inputmode: 'email' }) +
        field({ id: 'reg-pass', label: 'Password', type: 'password', icon: 'lock', placeholder: 'Password', autocomplete: 'new-password', toggle: true, describedby: 'strength-text',
          extra: '<div class="meter" id="meter" role="progressbar" aria-label="Password strength" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0"><span></span></div>' +
                 '<p class="strength-text" id="strength-text" aria-live="polite">Use 8+ characters with letters and numbers.</p>' }) +
        field({ id: 'reg-confirm', label: 'Confirm password', type: 'password', icon: 'lock', placeholder: 'Confirm password', autocomplete: 'new-password', toggle: true }) +
        '<div class="field"><label class="check"><input type="checkbox" id="reg-terms" required aria-describedby="reg-terms-err"> I agree to the demo terms</label><p class="field-error" id="reg-terms-err"></p></div>' +
        '<button class="btn btn-block" type="submit">Create account</button>' +
      '</form>' +
      '<p class="switch">Already have an account? <a href="#login" data-go="login">Sign in</a></p>' +
    '</section>' +

    '<section data-view="forgot" aria-labelledby="t-forgot" hidden>' +
      '<h1 id="t-forgot">Reset password</h1><p class="sub">Enter your email. This is a demo, so no email is sent.</p>' +
      '<div class="alert info" id="forgot-alert" role="status" hidden></div>' +
      '<form id="forgot-form" novalidate>' +
        field({ id: 'forgot-email', label: 'Email', type: 'email', icon: 'mail', placeholder: 'Email', autocomplete: 'email', inputmode: 'email' }) +
        '<button class="btn btn-block" type="submit">Send reset link</button>' +
      '</form>' +
      '<p class="switch"><a href="#login" data-go="login">Back to sign in</a></p>' +
    '</section>' +

    '<section data-view="done" aria-labelledby="t-done" hidden>' +
      '<div class="check-badge" aria-hidden="true">' + ICON.check + '</div>' +
      '<h1 id="t-done">You are signed in</h1><p class="sub" id="done-text"></p>' +
      '<button class="btn btn-block" type="button" id="logout">Sign out</button>' +
    '</section>';

  var $ = function (id) { return document.getElementById(id); };
  var views = {};
  [].forEach.call(root.querySelectorAll('[data-view]'), function (s) { views[s.getAttribute('data-view')] = s; });

  function show(name, focus) {
    Object.keys(views).forEach(function (k) { views[k].hidden = k !== name; });
    if (focus !== false) {
      var h = views[name].querySelector('h1');
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }
    if (['login', 'register', 'forgot'].indexOf(name) > -1) history.replaceState(null, '', '#' + name);
  }

  function setError(input, text) {
    var err = $(input.id + '-err');
    err.textContent = text || '';
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !text;
  }
  var rules = {
    email: function (i) { var v = i.value.trim(); return setError(i, !v ? 'Email is required.' : (!emailRe.test(v) ? 'Enter a valid email, for example you@example.com.' : '')); },
    name: function (i) { var v = i.value.trim(); return setError(i, v.length < 2 ? 'Please enter your full name.' : ''); },
    pass: function (i) { return setError(i, !i.value ? 'Password is required.' : (i.value.length < 8 ? 'Password must be at least 8 characters.' : '')); },
    newpass: function (i) {
      var v = i.value;
      if (!v) return setError(i, 'Password is required.');
      if (v.length < 8) return setError(i, 'Password must be at least 8 characters.');
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return setError(i, 'Include at least one letter and one number.');
      return setError(i, '');
    },
    confirm: function (i) { return setError(i, i.value !== $('reg-pass').value ? 'Passwords do not match.' : (!i.value ? 'Please confirm your password.' : '')); }
  };
  var bind = { 'login-email': 'email', 'login-pass': 'pass', 'reg-name': 'name', 'reg-email': 'email', 'reg-pass': 'newpass', 'reg-confirm': 'confirm', 'forgot-email': 'email' };
  Object.keys(bind).forEach(function (id) {
    var el = $(id), rule = rules[bind[id]];
    el.addEventListener('blur', function () { if (el.value) rule(el); });
    el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) rule(el); });
  });
  $('reg-pass').addEventListener('input', function () { var c = $('reg-confirm'); if (c.value) rules.confirm(c); });

  // Show / hide password
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toggle-for]');
    if (t) {
      var input = $(t.getAttribute('data-toggle-for'));
      var showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      t.setAttribute('aria-pressed', showing ? 'false' : 'true');
      t.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      t.querySelector('.i-eye').hidden = !showing;
      t.querySelector('.i-eye-off').hidden = showing;
      return;
    }
    var g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); show(g.getAttribute('data-go')); return; }
    var s = e.target.closest('[data-social]');
    if (s) UI.toast(s.getAttribute('data-social') + ' sign in is a visual demo only.', 'info');
  });

  // Password strength meter
  var meter = $('meter'), strengthText = $('strength-text');
  var LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  function score(v) {
    if (!v) return 0;
    var s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    if (/^(password|12345678|qwerty|letmein)/i.test(v)) s = Math.min(s, 1);
    return Math.min(4, Math.max(v.length < 8 ? Math.min(s, 1) : s - 1, v ? 1 : 0));
  }
  $('reg-pass').addEventListener('input', function () {
    var v = this.value, sc = score(v);
    meter.setAttribute('aria-valuenow', sc);
    meter.setAttribute('data-score', sc);
    meter.firstChild.style.transform = 'scaleX(' + (v ? Math.max(sc, 1) / 4 : 0) + ')';
    if (!v) { strengthText.textContent = 'Use 8+ characters with letters and numbers.'; return; }
    var tips = [];
    if (v.length < 8) tips.push('8+ characters');
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v)) tips.push('upper and lower case');
    if (!/\d/.test(v)) tips.push('a number');
    if (!/[^A-Za-z0-9]/.test(v)) tips.push('a symbol');
    strengthText.textContent = 'Strength: ' + LABELS[sc] + (tips.length && sc < 4 ? '. Add ' + tips.join(', ') + '.' : '.');
  });

  // Storage helpers
  function users() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } }
  function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
  function hashFor(email, pass) { return UI.sha256('lt|' + email.toLowerCase() + '|' + pass); }
  function findUser(email) {
    email = email.toLowerCase();
    if (email === SEED.email) return { name: SEED.name, email: SEED.email, hash: SEED.hash };
    return users().filter(function (u) { return u.email === email; })[0];
  }
  function alertMsg(el, text) { el.hidden = !text; el.textContent = text || ''; }

  // Remembered email
  try { var rem = localStorage.getItem(REMEMBER_KEY); if (rem) { $('login-email').value = rem; $('login-remember').checked = true; } } catch (e) { /* ignore */ }

  $('fill-demo').addEventListener('click', function () {
    $('login-email').value = SEED.email; $('login-pass').value = 'Demo@1234';
    rules.email($('login-email')); rules.pass($('login-pass'));
    $('login-pass').focus();
  });

  // Sign in
  var failed = 0, lockTimer = null;
  function startLock(sec) {
    var btn = $('login-btn'), until = Date.now() + sec * 1000;
    btn.disabled = true; clearInterval(lockTimer);
    lockTimer = setInterval(function () {
      var left = Math.ceil((until - Date.now()) / 1000);
      if (left <= 0) { clearInterval(lockTimer); btn.disabled = false; btn.textContent = 'Sign in'; failed = 0; alertMsg($('login-alert'), ''); }
      else btn.textContent = 'Try again in ' + left + 's';
    }, 500);
  }
  function finishLogin(user, remember) {
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, user.email); else localStorage.removeItem(REMEMBER_KEY);
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name }));
    } catch (e) { /* storage blocked: session lasts for this visit only */ }
    $('done-text').textContent = 'Welcome, ' + user.name + ' (' + user.email + ').' + (remember ? ' We will remember you on this device.' : '');
    show('done');
    UI.toast('Signed in successfully.', 'success');
  }
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('login-email'), pw = $('login-pass'), alertEl = $('login-alert');
    alertMsg(alertEl, '');
    var a = rules.email(em), b = rules.pass(pw);
    if (!a || !b) { (a ? pw : em).focus(); return; }
    var btn = $('login-btn');
    btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Signing in...';
    hashFor(em.value.trim(), pw.value).then(function (h) {
      setTimeout(function () {
        btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = 'Sign in';
        var u = findUser(em.value.trim());
        if (u && u.hash === h) { failed = 0; pw.value = ''; finishLogin(u, $('login-remember').checked); }
        else {
          failed++;
          alertMsg(alertEl, 'Incorrect email or password. ' + Math.max(0, 5 - failed) + ' attempt(s) left.');
          UI.toast('Sign in failed.', 'error'); pw.focus();
          if (failed >= 5) { alertMsg(alertEl, 'Too many attempts. Please wait 30 seconds.'); startLock(30); }
        }
      }, 350);
    });
  });

  // Register
  $('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('reg-name'), em = $('reg-email'), pw = $('reg-pass'), cf = $('reg-confirm'), terms = $('reg-terms');
    var results = [rules.name(n), rules.email(em), rules.newpass(pw), rules.confirm(cf)];
    var okTerms = terms.checked;
    $('reg-terms-err').textContent = okTerms ? '' : 'You need to accept the terms to continue.';
    var firstBad = [n, em, pw, cf].filter(function (_, i) { return !results[i]; })[0];
    if (firstBad || !okTerms) { (firstBad || terms).focus(); return; }
    if (findUser(em.value.trim())) { setError(em, 'An account with this email already exists.'); em.focus(); return; }
    hashFor(em.value.trim(), pw.value).then(function (h) {
      try {
        var list = users(); list.push({ name: n.value.trim(), email: em.value.trim().toLowerCase(), hash: h }); saveUsers(list);
      } catch (err) { UI.toast('Could not save the account because browser storage is blocked.', 'error'); return; }
      UI.toast('Account created. You can sign in now.', 'success');
      $('login-email').value = em.value.trim().toLowerCase(); $('login-pass').value = '';
      $('register-form').reset(); meter.setAttribute('aria-valuenow', 0); meter.firstChild.style.transform = 'scaleX(0)';
      show('login'); alertMsg($('login-alert'), '');
      $('login-pass').focus();
    });
  });

  // Forgot password
  $('forgot-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('forgot-email');
    if (!rules.email(em)) { em.focus(); return; }
    alertMsg($('forgot-alert'), 'If an account exists for ' + em.value.trim() + ', a reset link would be sent. (Demo: nothing is sent.)');
    UI.toast('Reset link requested.', 'success');
    em.value = '';
  });

  $('logout').addEventListener('click', function () {
    try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
    show('login'); UI.toast('Signed out.', 'info');
  });

  // Entry state
  var initial = (location.hash || '').replace('#', '');
  try {
    var sess = JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || 'null');
    if (sess && sess.email) { $('done-text').textContent = 'Welcome back, ' + sess.name + ' (' + sess.email + ').'; show('done', false); initial = ''; }
  } catch (e) { /* ignore */ }
  if (initial === 'register' || initial === 'forgot') show(initial, false);
  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if ((h === 'login' || h === 'register' || h === 'forgot') && views.done.hidden) show(h, false);
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open]');
    if (t) { e.preventDefault(); if (views.done.hidden) show(t.getAttribute('data-open')); }
  });
})();

