const upload = document.getElementById('upload');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const charsetSelect = document.getElementById('charset');
const customCharsInput = document.getElementById('customChars');
const convertBtn = document.getElementById('convert');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');
const asciiArt = document.getElementById('ascii-art');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let loadedImage = null;

const charsetMap = {
  dots: "⣿⠿⠾⠽⠼⠻⠺⠹⠸⠷⠶⠵⠴⠳⠲⠱⠰⠯⠮⠭⠬⠫⠪⠩⠨⠧⠦⠥⠤⠣⠢⠡⠠⠟⠞⠝⠜⠛⠚⠙⠘⠗⠖⠕⠔⠓⠒⠑⠐⠏⠎⠍⠌⠋⠊⠉⠈⠇⠆⠅⠄⠃⠂⠁⠀",
  numbers: "0123456789",
  alpha_upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  alpha_lower: "abcdefghijklmnopqrstuvwxyz",
  alpha_both: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  kana: "アイウエオカキクケコサシスセソ",
  hiragana: "あいうえおかきくけこさしすせそ",
  kanji: "日月火水木金土山川田人力口"
};

upload.addEventListener('change', () => {
  const file = upload.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      asciiArt.textContent = "画像が読み込まれました！変換ボタンを押してください。";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

charsetSelect.addEventListener('change', () => {
  customCharsInput.style.display = charsetSelect.value === 'custom' ? 'inline-block' : 'none';
});

document.querySelectorAll('input[name="scaleMode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    heightInput.disabled = document.querySelector('input[name="scaleMode"]:checked').value === 'aspect';
  });
});

convertBtn.addEventListener('click', () => {
  if (!loadedImage) {
    alert("画像をアップロードしてください！");
    return;
  }

  const scaleMode = document.querySelector('input[name="scaleMode"]:checked').value;
  const inputWidth = parseInt(widthInput.value);
  const inputHeight = parseInt(heightInput.value);

  const imgAspect = loadedImage.width / loadedImage.height;

  let finalWidth, finalHeight;
  if (scaleMode === "aspect") {
    finalWidth = inputWidth;
    finalHeight = Math.round(inputWidth / imgAspect);
  } else {
    finalWidth = inputWidth;
    finalHeight = inputHeight;
  }

  let charset = charsetSelect.value === 'custom' ? customCharsInput.value.trim() : charsetMap[charsetSelect.value];
  if (!charset || charset.length === 0) {
    alert('文字セットが無効です');
    return;
  }

  canvas.width = finalWidth;
  canvas.height = finalHeight;

  ctx.clearRect(0, 0, finalWidth, finalHeight);
  ctx.drawImage(loadedImage, 0, 0, finalWidth, finalHeight);

  const imgData = ctx.getImageData(0, 0, finalWidth, finalHeight).data;

  let result = '';
  for (let y = 0; y < finalHeight; y++) {
    for (let x = 0; x < finalWidth; x++) {
      const i = (y * finalWidth + x) * 4;
      const brightness = (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3;
      const index = Math.floor((brightness / 255) * (charset.length - 1));
      result += charset[index];
    }
    result += '\n';
  }

  asciiArt.textContent = result;
});

copyBtn.addEventListener('click', () => {
  if (!asciiArt.textContent.trim()) return;
  navigator.clipboard.writeText(asciiArt.textContent)
    .then(() => alert('コピーしました！'))
    .catch(() => alert('コピー失敗'));
});

downloadBtn.addEventListener('click', () => {
  if (!asciiArt.textContent.trim()) return;
  const blob = new Blob([asciiArt.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aa.txt';
  a.click();
  URL.revokeObjectURL(url);
});
