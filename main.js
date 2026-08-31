'use strict';

const MAX_DIMENSION = 1000;
const MAX_OUTPUT_PIXELS = 500000;
const numberFormatter = new Intl.NumberFormat('en-US');

const elements = Object.freeze({
  controls: document.getElementById('controls'),
  upload: document.getElementById('upload'),
  dropZone: document.getElementById('dropZone'),
  previewFrame: document.getElementById('previewFrame'),
  imagePreview: document.getElementById('imagePreview'),
  imageName: document.getElementById('imageName'),
  imageMeta: document.getElementById('imageMeta'),
  width: document.getElementById('width'),
  height: document.getElementById('height'),
  charset: document.getElementById('charset'),
  customCharsField: document.getElementById('customCharsField'),
  customChars: document.getElementById('customChars'),
  convert: document.getElementById('convert'),
  clear: document.getElementById('clear'),
  copy: document.getElementById('copy'),
  download: document.getElementById('download'),
  outputMeta: document.getElementById('outputMeta'),
  emptyState: document.getElementById('emptyState'),
  asciiArt: document.getElementById('ascii-art'),
  canvas: document.getElementById('canvas'),
  toast: document.getElementById('toast')
});

const context = elements.canvas.getContext('2d', { willReadFrequently: true });
const scaleModeInputs = Array.from(document.querySelectorAll('input[name="scaleMode"]'));

const CHARSETS = Object.freeze({
  dots: '⣿⠿⠾⠽⠼⠻⠺⠹⠸⠷⠶⠵⠴⠳⠲⠱⠰⠯⠮⠭⠬⠫⠪⠩⠨⠧⠦⠥⠤⠣⠢⠡⠠⠟⠞⠝⠜⠛⠚⠙⠘⠗⠖⠕⠔⠓⠒⠑⠐⠏⠎⠍⠌⠋⠊⠉⠈⠇⠆⠅⠄⠃⠂⠁⠀',
  numbers: '0123456789',
  alpha_upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alpha_lower: 'abcdefghijklmnopqrstuvwxyz',
  alpha_both: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  kana: 'アイウエオカキクケコサシスセソ',
  hiragana: 'あいうえおかきくけこさしすせそ',
  kanji: '日月火水木金土山川田人力口'
});

const state = {
  image: null,
  objectUrl: null,
  output: '',
  toastTimer: null,
  loadVersion: 0
};

function getScaleMode() {
  return scaleModeInputs.find((input) => input.checked)?.value ?? 'aspect';
}

function showToast(message, type = 'info') {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle('is-error', type === 'error');
  elements.toast.classList.add('is-visible');

  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove('is-visible');
  }, 2400);
}

function revokeImageUrl() {
  if (!state.objectUrl) return;
  URL.revokeObjectURL(state.objectUrl);
  state.objectUrl = null;
}

function resetOutput() {
  state.output = '';
  elements.asciiArt.textContent = '';
  elements.asciiArt.classList.add('is-hidden');
  elements.emptyState.classList.remove('is-hidden');
  elements.copy.disabled = true;
  elements.download.disabled = true;
  elements.outputMeta.textContent = state.image ? 'Ready to convert' : 'Waiting for an image';
}

function clearImage() {
  state.loadVersion += 1;
  revokeImageUrl();
  state.image = null;
  elements.upload.value = '';
  elements.imagePreview.removeAttribute('src');
  elements.imageName.textContent = '';
  elements.imageMeta.textContent = '';
  elements.previewFrame.classList.add('is-hidden');
  elements.convert.disabled = true;
  elements.clear.disabled = true;
  resetOutput();
}

function syncAspectHeight() {
  const isAspectMode = getScaleMode() === 'aspect';
  elements.height.disabled = isAspectMode;

  if (!isAspectMode || !state.image) return;

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isFinite(width) || width < 1) return;

  const height = Math.max(
    1,
    Math.round(width * (state.image.naturalHeight / state.image.naturalWidth))
  );
  elements.height.value = String(height);
}

function loadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please choose a valid image file.', 'error');
    return;
  }

  const loadVersion = ++state.loadVersion;
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';

  image.onload = () => {
    if (loadVersion !== state.loadVersion) {
      URL.revokeObjectURL(objectUrl);
      return;
    }

    revokeImageUrl();
    state.image = image;
    state.objectUrl = objectUrl;

    elements.imagePreview.src = objectUrl;
    elements.imageName.textContent = file.name;
    elements.imageMeta.textContent = `${numberFormatter.format(image.naturalWidth)} × ${numberFormatter.format(image.naturalHeight)} px`;
    elements.previewFrame.classList.remove('is-hidden');
    elements.convert.disabled = false;
    elements.clear.disabled = false;

    syncAspectHeight();
    resetOutput();
    showToast('Image ready.');
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    if (loadVersion !== state.loadVersion) return;
    showToast('This image could not be decoded.', 'error');
  };

  image.src = objectUrl;
}

function readDimensions() {
  if (!state.image) {
    throw new Error('Choose an image first.');
  }

  const width = Number.parseInt(elements.width.value, 10);
  if (!Number.isInteger(width) || width < 4 || width > MAX_DIMENSION) {
    throw new Error(`Width must be between 4 and ${MAX_DIMENSION}.`);
  }

  let height;
  if (getScaleMode() === 'aspect') {
    height = Math.max(
      1,
      Math.round(width * (state.image.naturalHeight / state.image.naturalWidth))
    );
  } else {
    height = Number.parseInt(elements.height.value, 10);
  }

  if (!Number.isInteger(height) || height < 1 || height > MAX_DIMENSION) {
    throw new Error(`Height must be between 1 and ${MAX_DIMENSION}.`);
  }

  const pixelCount = width * height;
  if (pixelCount > MAX_OUTPUT_PIXELS) {
    throw new Error(
      `Output is too large. Keep it under ${numberFormatter.format(MAX_OUTPUT_PIXELS)} characters.`
    );
  }

  return { width, height, pixelCount };
}

function readCharset() {
  const rawCharset = elements.charset.value === 'custom'
    ? elements.customChars.value
    : CHARSETS[elements.charset.value];

  const characters = Array.from(rawCharset ?? '');
  if (characters.length < 2) {
    throw new Error('Use at least two characters in the character set.');
  }

  return characters;
}

function pixelBrightness(data, index) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const alpha = data[index + 3] / 255;
  const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);

  return 255 - ((255 - luminance) * alpha);
}

function renderAscii(image, width, height, characters) {
  elements.canvas.width = width;
  elements.canvas.height = height;

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const data = context.getImageData(0, 0, width, height).data;
  const maxCharacterIndex = characters.length - 1;
  const rows = new Array(height);

  for (let y = 0; y < height; y += 1) {
    const row = new Array(width);
    const rowOffset = y * width;

    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (rowOffset + x) * 4;
      const brightness = pixelBrightness(data, pixelIndex);
      const characterIndex = Math.min(
        maxCharacterIndex,
        Math.floor((brightness / 255) * characters.length)
      );
      row[x] = characters[characterIndex];
    }

    rows[y] = row.join('');
  }

  return rows.join('\n');
}

function setBusy(isBusy) {
  elements.convert.disabled = isBusy || !state.image;
  elements.clear.disabled = isBusy || !state.image;
  elements.convert.textContent = isBusy ? 'Converting…' : 'Convert image';
}

function convertImage() {
  let dimensions;
  let characters;

  try {
    dimensions = readDimensions();
    characters = readCharset();
  } catch (error) {
    showToast(error.message, 'error');
    return;
  }

  const image = state.image;
  setBusy(true);
  elements.outputMeta.textContent = 'Converting…';

  window.requestAnimationFrame(() => {
    try {
      state.output = renderAscii(
        image,
        dimensions.width,
        dimensions.height,
        characters
      );

      elements.asciiArt.textContent = state.output;
      elements.emptyState.classList.add('is-hidden');
      elements.asciiArt.classList.remove('is-hidden');
      elements.copy.disabled = false;
      elements.download.disabled = false;
      elements.outputMeta.textContent = `${dimensions.width} × ${dimensions.height} · ${numberFormatter.format(dimensions.pixelCount)} characters`;
      showToast('ASCII art created.');
    } catch (error) {
      console.error(error);
      elements.outputMeta.textContent = 'Conversion failed';
      showToast('Conversion failed. Try a smaller output size.', 'error');
    } finally {
      setBusy(false);
    }
  });
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) {
    throw new Error('Copy command failed.');
  }
}

async function copyOutput() {
  if (!state.output) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(state.output);
    } else {
      fallbackCopy(state.output);
    }
    showToast('Copied to clipboard.');
  } catch (error) {
    console.error(error);
    showToast('Copy failed.', 'error');
  }
}

function downloadOutput() {
  if (!state.output) return;

  const blob = new Blob([state.output], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ascii-art.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast('Download started.');
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove('is-dragging');
  loadImageFile(event.dataTransfer?.files?.[0]);
}

elements.upload.addEventListener('change', () => {
  loadImageFile(elements.upload.files?.[0]);
});

elements.dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  elements.dropZone.classList.add('is-dragging');
});

elements.dropZone.addEventListener('dragleave', () => {
  elements.dropZone.classList.remove('is-dragging');
});

elements.dropZone.addEventListener('drop', handleDrop);

elements.dropZone.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  elements.upload.click();
});

elements.charset.addEventListener('change', () => {
  const isCustom = elements.charset.value === 'custom';
  elements.customCharsField.classList.toggle('is-hidden', !isCustom);
  if (isCustom) elements.customChars.focus();
});

scaleModeInputs.forEach((input) => {
  input.addEventListener('change', syncAspectHeight);
});

elements.width.addEventListener('input', syncAspectHeight);

elements.controls.addEventListener('submit', (event) => {
  event.preventDefault();
  convertImage();
});

elements.clear.addEventListener('click', clearImage);
elements.copy.addEventListener('click', copyOutput);
elements.download.addEventListener('click', downloadOutput);
window.addEventListener('beforeunload', revokeImageUrl);
