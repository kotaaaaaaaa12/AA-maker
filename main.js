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
  dots: "⣿⣷⣯⣟⡿⠿⠛⠉⠀",
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
  if (charsetSelect.value === 'custom') {
    customCharsInput.style.display = 'inline-block';
  } else {
    customCharsInput.style.display = 'none';
  }
});

convertBtn.addEventListener('click', () => {
  if (!loadedImage) {
    alert("画像をアップロードしてください！");
    return;
  }

  let inputWidth = parseInt(widthInput.value);
  let inputHeight = parseInt(heightInput.value);

  if (!inputWidth && !inputHeight) {
    alert("横幅か縦幅のどちらかは必ず指定してください！");
    return;
  }

  const imgAspect = loadedImage.width / loadedImage.height;

  let finalWidth, finalHeight;
  if (inputWidth && inputHeight) {
    finalWidth = inputWidth;
    finalHeight = inputHeight;
  } else if (inputWidth) {
    finalWidth = inputWidth;
    finalHeight = Math.round(inputWidth / imgAspect);
  } else if (inputHeight) {
    finalHeight = inputHeight;
    finalWidth = Math.round(inputHeight * imgAspect);
  }

  let charset = '';
  if (charsetSelect.value === 'custom') {
    charset = customCharsInput.value.trim();
    if (!charset) {
      alert('オリジナル文字セットを入力してください！');
      return;
    }
  } else {
    charset = charsetMap[charsetSelect.value];
  }

  canvas.width = finalWidth;
  canvas.height = finalHeight;

  ctx.clearRect(0, 0, finalWidth, finalHeight);
  ctx.drawImage(loadedImage, 0, 0, finalWidth, finalHeight);

  const imgData = ctx.getImageData(0, 0, finalWidth, finalHeight);
  const data = imgData.data;

  let result = '';
  for (let y = 0; y < finalHeight; y++) {
    for (let x = 0; x < finalWidth; x++) {
      const i = (y * finalWidth + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      const index = Math.floor((brightness / 255) * (charset.length - 1));
      result += charset[index];
    }
    result += '\n';
  }

  asciiArt.textContent = result;
});

copyBtn.addEventListener('click', () => {
  if (!asciiArt.textContent.trim()) {
    alert('変換結果がありません！');
    return;
  }
  navigator.clipboard.writeText(asciiArt.textContent)
    .then(() => alert('コピーしました！'))
    .catch(() => alert('コピーに失敗しました。'));
});

downloadBtn.addEventListener('click', () => {
  if (!asciiArt.textContent.trim()) {
    alert('変換結果がありません！');
    return;
  }
  const blob = new Blob([asciiArt.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aa.txt';
  a.click();
  URL.revokeObjectURL(url);
});
