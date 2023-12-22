const blocks = [];
const blockColors = {};
let containerSize = {
  width: window.innerWidth,
  height: window.innerHeight * 0.8,
};

function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function calculateBlockPlacement() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  let blockCoordinates = [];

  blocks.forEach((block, index) => {
    let placed = false;
    let rotation = false;

    while (!placed && !rotation) {
      for (let y = 0; y <= containerSize.height - block.height; y++) {
        for (let x = 0; x <= containerSize.width - block.width; x++) {
          const overlap = blockCoordinates.some(
            (coord) =>
              x < coord.right &&
              x + block.width > coord.left &&
              y < coord.bottom &&
              y + block.height > coord.top
          );

          const outsideContainer =
            x < 0 ||
            y < 0 ||
            x + block.width > containerSize.width ||
            y + block.height > containerSize.height;

          if (!overlap && !outsideContainer) {
            const color =
              blockColors[`${block.width}-${block.height}`] ||
              generateRandomColor();

            blockColors[`${block.width}-${block.height}`] = color;

            blockCoordinates.push({
              top: y,
              left: x,
              right: x + block.width,
              bottom: y + block.height,
              initialOrder: index + 1,
              color: color,
            });

            placed = true;
            break;
          }
        }

        if (placed) break;
      }

      if (!placed && !rotation) {
        // Rotate the block and try again
        const temp = block.width;
        block.width = block.height;
        block.height = temp;
        rotation = true;
      }
    }
  });

  // Calculate fullness
  const totalArea = containerSize.width * containerSize.height;
  const occupiedArea = blockCoordinates.reduce(
    (acc, coord) =>
      acc + (coord.right - coord.left) * (coord.bottom - coord.top),
    0
  );

  const fullness = 1 - occupiedArea / totalArea;

  const fullnessDisplay = document.getElementById("fullnessDisplay");
  fullnessDisplay.innerText = `Fullness: ${Math.round(fullness * 100)}%`;

  // Display blocks on the UI
  blockCoordinates.forEach((coord) => {
    const blockElement = document.createElement("div");
    blockElement.className = "block";
    blockElement.style.width = `${coord.right - coord.left}px`;
    blockElement.style.height = `${coord.bottom - coord.top}px`;
    blockElement.style.top = `${coord.top}px`;
    blockElement.style.left = `${coord.left}px`;
    blockElement.innerText = coord.initialOrder;
    blockElement.style.backgroundColor = coord.color;

    container.appendChild(blockElement);
  });

  console.log({ fullness, blockCoordinates });
}

function addBlock() {
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");

  const width = parseInt(widthInput.value, 10);
  const height = parseInt(heightInput.value, 10);

  if (!isNaN(width) && !isNaN(height)) {
    blocks.push({ width, height });
    calculateBlockPlacement();
  }
}

window.addEventListener("resize", () => {
  containerSize = {
    width: window.innerWidth,
    height: window.innerHeight * 0.8,
  };
  calculateBlockPlacement();
});

fetch("blocks.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("Data from blocks.json:", data);

    blocks.push(...data);

    calculateBlockPlacement();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
