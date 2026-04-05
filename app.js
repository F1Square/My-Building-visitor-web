// ── Config ───────────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://10.10.5.59:5000';

// ── Validation Regexes ───────────────────────────────────────────────────────
// Full name: only letters + spaces, min 2 words, each word min 2 letters
var NAME_RE = /^[A-Za-z]{2,}(\s+[A-Za-z]{2,})+$/;

// Indian mobile: starts with 6/7/8/9, exactly 10 digits
var MOBILE_RE = /^[6-9]\d{9}$/;

// Flat no: 1-3 wing letters + dash + exactly 3 digits  e.g. A-101, AB-202
var FLAT_RE = /^[A-Za-z]{1,3}-\d{3}$/;

// Purpose: only letters, spaces and basic punctuation (no numbers/symbols)
var PURPOSE_RE = /^[A-Za-z\s,.\-']+$/;

// ── State ────────────────────────────────────────────────────────────────────
var photoBase64 = null;
var buildingId  = null;
var buildingName = '';

// ── Init ─────────────────────────────────────────────────────────────────────
(function init() {
  var params = new URLSearchParams(window.location.search);
  buildingId = params.get('building_id');

  if (!buildingId) { show('notFoundView'); return; }

  fetch(BACKEND_URL + '/entry/building/' + buildingId + '/info')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.error || !data.id) { show('notFoundView'); return; }
      buildingName = data.name;
      document.getElementById('buildingName').textContent = data.name;
      document.getElementById('buildingAddress').textContent = data.address || 'Visitor Entry Form';
      show('formView');
    })
    .catch(function () { show('notFoundView'); });
})();

// ── Photo (front camera selfie) ───────────────────────────────────────────────
document.getElementById('photoInput').addEventListener('change', function () {
  var file = this.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      // Compress to max 800px
      var canvas = document.createElement('canvas');
      var MAX = 800;
      var ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width  = img.width  * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      photoBase64 = canvas.toDataURL('image/jpeg', 0.75);

      var preview = document.getElementById('photoPreview');
      preview.src = photoBase64;
      preview.classList.remove('hidden');
      document.getElementById('photoLabel').textContent = 'Selfie taken ✓';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ── Submit with full validation ───────────────────────────────────────────────
function submitForm() {
  hideError();

  var name    = document.getElementById('name').value.trim();
  var mobile  = document.getElementById('mobile').value.trim();
  var flat_no = document.getElementById('flat_no').value.trim().toUpperCase();
  var purpose = document.getElementById('purpose').value.trim();

  // Full name
  if (!name)
    return showError('Full name is required');
  if (!NAME_RE.test(name))
    return showError('Full name must contain only letters with at least 2 words (e.g. Rahul Sharma). No numbers or symbols allowed.');

  // Mobile
  if (!mobile)
    return showError('Mobile number is required');
  if (!MOBILE_RE.test(mobile))
    return showError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9');

  // Flat number
  if (!flat_no)
    return showError('Visiting flat number is required');
  if (!FLAT_RE.test(flat_no))
    return showError('Flat number must be in format Wing-Number (e.g. A-101, B-204, AB-301)');

  // Purpose
  if (!purpose)
    return showError('Purpose of visit is required');
  if (!PURPOSE_RE.test(purpose))
    return showError('Purpose must contain only text — no numbers or special characters allowed');
  var words = purpose.split(/\s+/).filter(function (w) { return w.length > 0; });
  if (words.length < 3)
    return showError('Purpose must be at least 3 words (e.g. Here for parcel delivery)');

  // Photo
  if (!photoBase64)
    return showError('A live selfie photo is required — please take your photo');

  var btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  fetch(BACKEND_URL + '/entry/building/' + buildingId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      mobile: mobile,
      flat_no: flat_no,
      purpose: purpose,
      photo_url: photoBase64
    })
  })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (data.error) {
      showError(data.error);
      btn.disabled = false;
      btn.textContent = 'Register Entry';
    } else {
      document.getElementById('successMsg').textContent =
        'Your visit to ' + buildingName + ' has been recorded. The residents have been notified.';
      show('successView');
    }
  })
  .catch(function () {
    showError('Network error. Please check your connection and try again.');
    btn.disabled = false;
    btn.textContent = 'Register Entry';
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function show(id) {
  ['loadingView', 'notFoundView', 'formView', 'successView'].forEach(function (v) {
    document.getElementById(v).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function showError(msg) {
  var el = document.getElementById('errMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  document.getElementById('errMsg').classList.add('hidden');
}
