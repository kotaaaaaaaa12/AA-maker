const upload = document.getElementById('upload');
const sizeInput = document.getElementById('size');
const asciiArt = document.getElementById('ascii-art');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 仮の文字セット（暗→明）
const charset = "@%#*+=-:. ";

upload.addEventListener('change', () => {
  const file = upload.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const size = parseInt(sizeInput.value);
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;

      let result = '';
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4;
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
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});
