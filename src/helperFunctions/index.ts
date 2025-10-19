// Add this helper function at the top of both TransmitterPage.tsx and GaugePage.tsx
export function calculateAppliedValues(
  rangeFrom: string,
  rangeTo: string
): {
  appliedUpscale: string[];
  appliedDownscale: string[];
} {
  const lrv = Number(rangeFrom);
  const urv = Number(rangeTo);

  // Handle invalid or equal values
  if (isNaN(lrv) || isNaN(urv) || lrv === urv) {
    return {
      appliedUpscale: Array(5).fill(""),
      appliedDownscale: Array(5).fill(""),
    };
  }

  const range = urv - lrv;

  const upscale = [0, 0.25, 0.5, 0.75, 1].map((p) =>
    (lrv + p * range).toFixed(2)
  );

  const downscale = [1, 0.75, 0.5, 0.25, 0].map((p) =>
    (lrv + p * range).toFixed(2)
  );

  return {
    appliedUpscale: upscale,
    appliedDownscale: downscale,
  };
}

export const isOutOfTolerance = (
  applied: string,
  actual: string,
  tolerance: number,
  range: number
) => {
  // Convert to float, handle empty values
  if (applied === "" || actual === "" || isNaN(tolerance)) return false;
  return Math.abs(Number(applied) - Number(actual)) > (tolerance / 100) * range;
};

export const isValveTimeOutOfTolerance = (
  appliedValue: number,
  tolerance: number,
  valveSize: number,
  valveType: string
) => {
  let state = false;
  if (valveType.toUpperCase() === "SDV") {
    state = appliedValue > (tolerance / 100) * valveSize + valveSize;
  } else if (valveType.toUpperCase() === "BDV") {
    state = appliedValue > (tolerance / 100) * valveSize + valveSize;
  } else if (valveType.toUpperCase() === "SEQUENCE") {
    state = appliedValue > (tolerance / 100) * valveSize + valveSize;
  }
  return state;
};
