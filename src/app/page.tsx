"use client";

import { useState } from "react";

export default function Home() {
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [panelsPlaced, setPanelsPlaced] = useState(0);

  const createRoofMatrix = (x: number, y: number) => 
    Array(y).fill(null).map(() => Array(x).fill("  "));

  const canPlacePanel = (matrix: string[][], startX: number, startY: number, width: number, height: number) => {
    if (startX + width > matrix[0].length || startY + height > matrix.length) return false;

    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        if (matrix[y][x] !== "  ") return false;
      }
    }
    return true;
  };

  const placePanel = (matrix: string[][], startX: number, startY: number, width: number, height: number, panelId: number) => {
    const panelSymbol = panelId < 10 ? `0${panelId}` : `${panelId}`;
    
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        matrix[y][x] = panelSymbol;
      }
    }
  };

  const placePanelsInRange = (matrix: string[][], width: number, height: number, startRow: number, endRow: number, startCol: number, endCol: number, panelId: number, targetPanels: number) => {
    let panelsPlaced = 0;
    let currentPanelId = panelId;
    
    for (let row = startRow; row < endRow && panelsPlaced < targetPanels; row++) {
      for (let col = startCol; col < endCol && panelsPlaced < targetPanels; col++) {
        if (canPlacePanel(matrix, col, row, width, height)) {
          placePanel(matrix, col, row, width, height, currentPanelId);
          panelsPlaced++;
          currentPanelId++;
        }
      }
    }
    
    return { panelsPlaced, nextPanelId: currentPanelId };
  };

  const createStrategy = (a: number, b: number, x: number, y: number, targetPanels: number, horizontalFirst: boolean = true) => () => {
    const matrix = createRoofMatrix(x, y);
    let totalPanelsPlaced = 0;
    let panelId = 1;
    
    const placePanels = (width: number, height: number) => {
      const result = placePanelsInRange(matrix, width, height, 0, y, 0, x, panelId, targetPanels - totalPanelsPlaced);
      totalPanelsPlaced += result.panelsPlaced;
      panelId = result.nextPanelId;
    };
    
    if (horizontalFirst) {
      placePanels(a, b);
      if (totalPanelsPlaced < targetPanels) placePanels(b, a);
    } else {
      placePanels(b, a);
      if (totalPanelsPlaced < targetPanels) placePanels(a, b);
    }
    
    return { matrix, panelsPlaced: totalPanelsPlaced };
  };



  const createDynamicDivisionStrategy = (a: number, b: number, x: number, y: number, targetPanels: number) => () => {
    const matrix = createRoofMatrix(x, y);
    let bestPanelsPlaced = 0;
    
    for (let splitPoint = 1; splitPoint < y; splitPoint++) {
      // Probar patrón H arriba + V abajo
      const tempMatrix1 = createRoofMatrix(x, y);
      let tempPanelsPlaced1 = 0;
      let tempPanelId1 = 1;
      
      // Colocar paneles horizontales en la sección superior
      const topResult1 = placePanelsInRange(tempMatrix1, a, b, 0, splitPoint, 0, x, tempPanelId1, targetPanels);
      tempPanelsPlaced1 += topResult1.panelsPlaced;
      tempPanelId1 = topResult1.nextPanelId;
      
      // Colocar paneles verticales en la sección inferior
      const bottomResult1 = placePanelsInRange(tempMatrix1, b, a, splitPoint, y, 0, x, tempPanelId1, targetPanels - tempPanelsPlaced1);
      tempPanelsPlaced1 += bottomResult1.panelsPlaced;
      
      // Probar patrón V arriba + H abajo
      const tempMatrix2 = createRoofMatrix(x, y);
      let tempPanelsPlaced2 = 0;
      let tempPanelId2 = 1;
      
      // Colocar paneles verticales en la sección superior
      const topResult2 = placePanelsInRange(tempMatrix2, b, a, 0, splitPoint, 0, x, tempPanelId2, targetPanels);
      tempPanelsPlaced2 += topResult2.panelsPlaced;
      tempPanelId2 = topResult2.nextPanelId;
      
      // Colocar paneles horizontales en la sección inferior
      const bottomResult2 = placePanelsInRange(tempMatrix2, a, b, splitPoint, y, 0, x, tempPanelId2, targetPanels - tempPanelsPlaced2);
      tempPanelsPlaced2 += bottomResult2.panelsPlaced;
      
      // Elegir el mejor resultado entre los dos patrones
      if (tempPanelsPlaced1 > bestPanelsPlaced) {
        bestPanelsPlaced = tempPanelsPlaced1;
        // Copiar la matriz temporal a la matriz principal
        for (let i = 0; i < y; i++) {
          for (let j = 0; j < x; j++) {
            matrix[i][j] = tempMatrix1[i][j];
          }
        }
      }
      
      if (tempPanelsPlaced2 > bestPanelsPlaced) {
        bestPanelsPlaced = tempPanelsPlaced2;
        // Copiar la matriz temporal a la matriz principal
        for (let i = 0; i < y; i++) {
          for (let j = 0; j < x; j++) {
            matrix[i][j] = tempMatrix2[i][j];
          }
        }
      }
    }
    
    return { matrix, panelsPlaced: bestPanelsPlaced };
  };

  const placePanelsSystematically = (a: number, b: number, x: number, y: number, targetPanels: number) => {
    const strategies = [
      createStrategy(a, b, x, y, targetPanels, true),   // Solo horizontales
      createStrategy(a, b, x, y, targetPanels, false),  // Solo verticales
      createStrategy(a, b, x, y, targetPanels, true),   // Mezcla H+V
      createStrategy(a, b, x, y, targetPanels, false),  // Mezcla V+H
      createDynamicDivisionStrategy(a, b, x, y, targetPanels)   // División dinámica
    ];
    
    let bestResult = strategies[0]();
    
    console.log(`=== BÚSQUEDA PARA ${targetPanels} PANELES ===`);
    
    for (let i = 0; i < strategies.length; i++) {
      const result = strategies[i]();
      console.log(`Estrategia ${i + 1}: ${result.panelsPlaced}/${targetPanels} paneles`);
      
      if (result.panelsPlaced === targetPanels) {
        console.log(`✅ Estrategia ${i + 1} EXITOSA`);
        return result;
      }
      
      if (result.panelsPlaced > bestResult.panelsPlaced) {
        bestResult = result;
      }
    }
    
    console.log(`❌ Mejor resultado: ${bestResult.panelsPlaced}/${targetPanels} paneles`);
    return bestResult;
  };

  const renderMatrixAsHTML = (matrix: string[][]) => {
    if (!matrix.length) return "";
    
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    const maxContainerWidth = 800;
    const maxContainerHeight = 600;
    const minCellSize = 12;
    const maxCellSize = 50;
    
    let cellSize = Math.min(maxContainerWidth / cols, maxContainerHeight / rows);
    cellSize = Math.max(minCellSize, Math.min(maxCellSize, cellSize));
    
    const containerWidth = cols * cellSize;
    const containerHeight = rows * cellSize;
    const fontSize = Math.max(6, Math.min(12, cellSize * 0.3));
    
    return (
      <div className="flex justify-center">
        <div
          className="grid gap-0 border-2 border-gray-800 bg-gray-50"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            width: `${containerWidth}px`,
            height: `${containerHeight}px`
          }}
        >
          {matrix.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`border border-gray-400 flex items-center justify-center font-bold ${
                  cell !== "  "
                    ? "bg-yellow-300 text-yellow-800 border-yellow-500"
                    : "bg-gray-100"
                }`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  fontSize: `${fontSize}px`,
                  minWidth: `${cellSize}px`,
                  minHeight: `${cellSize}px`
                }}
              >
                {cell !== "  " ? cell : ""}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const handleCalculate = () => {
    const a = document.getElementById("a") as HTMLInputElement;
    const b = document.getElementById("b") as HTMLInputElement;
    const x = document.getElementById("x") as HTMLInputElement;
    const y = document.getElementById("y") as HTMLInputElement;

    const aValue = parseInt(a.value);
    const bValue = parseInt(b.value);
    const xValue = parseInt(x.value);
    const yValue = parseInt(y.value);

    if (aValue && bValue && xValue && yValue) {
      const targetPanels = Math.floor((xValue * yValue) / (aValue * bValue));
      
      const { matrix: resultMatrix, panelsPlaced } = placePanelsSystematically(
        aValue, bValue, xValue, yValue, targetPanels
      );

      setMatrix(resultMatrix);
      setPanelsPlaced(panelsPlaced);

      console.log(`Matriz del techo (${xValue}x${yValue}) con paneles (${aValue}x${bValue}):`);
      console.log(`Paneles colocados: ${panelsPlaced}/${targetPanels}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <section className="bg-[var(--secondary-light)] w-200 h-200 rounded-2xl flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-lg mb-4 max-w-full overflow-x-auto">
          <h3 className="text-center mb-2 font-bold text-gray-800">
            Visualización del Techo
          </h3>
          <div className="flex justify-center">
            {matrix.length > 0 ? (
              renderMatrixAsHTML(matrix)
            ) : (
              <div className="w-300 h-200 border-2 border-gray-800 bg-gray-100 flex items-center justify-center text-gray-500">
                Ingresa valores y presiona Calculate
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2 font-bold">
          <div className="flex gap-2 items-center">
            <label htmlFor="a" className="text-white">a:</label>
            <input
              id="a"
              type="number"
              defaultValue={2}
              className="bg-white rounded-2xl p-2 text-center"
              min={1}
            />
            <label htmlFor="b" className="text-white">b:</label>
            <input
              id="b"
              defaultValue={3}
              type="number"
              className="bg-white rounded-2xl p-2 text-center"
              min={1}
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="x" className="text-white">x:</label>
            <input
              id="x"
              defaultValue={6}
              type="number"
              className="bg-white rounded-2xl p-2 text-center"
              min={1}
            />
            <label htmlFor="y" className="text-white">y:</label>
            <input
              id="y"
              defaultValue={7}
              type="number"
              className="bg-white rounded-2xl p-2 text-center"
              min={1}
            />
          </div>
          <button
            onClick={handleCalculate}
            className="bg-[var(--primary)] text-white rounded-2xl p-2 cursor-pointer hover:bg-yellow-500 transition-all duration-500 hover:scale-105"
          >
            Calculate
          </button>
        </div>
        {panelsPlaced > 0 && (
          <div className="text-white text-2xl font-bold mt-2 text-center">
            <p>Paneles colocados: <strong className="text-[var(--primary)]">{panelsPlaced}</strong></p>
          </div>
        )}
      </section>
    </main>
  );
}
