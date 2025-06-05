// Global variables
const converterType = document.getElementById("converter-type");
const inputValue = document.getElementById("input-value");
const inputUnit = document.getElementById("input-unit");
const outputValue = document.getElementById("output-value");
const outputUnit = document.getElementById("output-unit");
const swapUnitsBtn = document.getElementById("swap-units");
const convertBtn = document.getElementById("convert-btn");
const resetBtn = document.getElementById("reset-btn");
const toast = document.getElementById("toast");

// Define which unit types can have negative values
const allowsNegativeValues = {
  temperature: true,
  length: true,
  time: true,
  speed: true,
  area: false,
  volume: false,
  mass: false,
  data: false,
};

// Unit conversion data
const unitData = {
  area: {
    units: [
      { name: "Square Meter (m²)", value: "m2", factor: 1 },
      { name: "Square Kilometer (km²)", value: "km2", factor: 1e6 },
      { name: "Square Centimeter (cm²)", value: "cm2", factor: 1e-4 },
      { name: "Square Millimeter (mm²)", value: "mm2", factor: 1e-6 },
      { name: "Square Mile (mi²)", value: "mi2", factor: 2.59e6 },
      { name: "Square Yard (yd²)", value: "yd2", factor: 0.836127 },
      { name: "Square Foot (ft²)", value: "ft2", factor: 0.092903 },
      { name: "Square Inch (in²)", value: "in2", factor: 0.00064516 },
      { name: "Hectare (ha)", value: "ha", factor: 10000 },
      { name: "Acre (ac)", value: "ac", factor: 4046.86 },
    ],
  },
  length: {
    units: [
      { name: "Meter (m)", value: "m", factor: 1 },
      { name: "Kilometer (km)", value: "km", factor: 1000 },
      { name: "Centimeter (cm)", value: "cm", factor: 0.01 },
      { name: "Millimeter (mm)", value: "mm", factor: 0.001 },
      { name: "Micrometer (μm)", value: "um", factor: 1e-6 },
      { name: "Nanometer (nm)", value: "nm", factor: 1e-9 },
      { name: "Mile (mi)", value: "mi", factor: 1609.34 },
      { name: "Yard (yd)", value: "yd", factor: 0.9144 },
      { name: "Foot (ft)", value: "ft", factor: 0.3048 },
      { name: "Inch (in)", value: "in", factor: 0.0254 },
      { name: "Nautical Mile (nmi)", value: "nmi", factor: 1852 },
    ],
  },
  temperature: {
    units: [
      { name: "Celsius (°C)", value: "c" },
      { name: "Fahrenheit (°F)", value: "f" },
      { name: "Kelvin (K)", value: "k" },
    ],
    // Special conversion functions for temperature
    convert: function (value, fromUnit, toUnit) {
      try {
        if (isNaN(value)) {
          throw new Error("Invalid temperature value");
        }

        let result;

        // Convert to Celsius first
        let celsius;
        if (fromUnit === "c") {
          celsius = value;
        } else if (fromUnit === "f") {
          celsius = ((value - 32) * 5) / 9;
        } else if (fromUnit === "k") {
          celsius = value - 273.15;
        } else {
          throw new Error("Invalid temperature unit: " + fromUnit);
        }

        // Convert from Celsius to target unit
        if (toUnit === "c") {
          result = celsius;
        } else if (toUnit === "f") {
          result = (celsius * 9) / 5 + 32;
        } else if (toUnit === "k") {
          result = celsius + 273.15;
        } else {
          throw new Error("Invalid temperature unit: " + toUnit);
        }

        if (!isFinite(result) || isNaN(result)) {
          throw new Error(
            "Temperature conversion resulted in an invalid value"
          );
        }

        return result;
      } catch (error) {
        console.error("Temperature conversion error:", error);
        throw error; // Re-throw to be handled by the main conversion function
      }
    },
  },
  volume: {
    units: [
      { name: "Cubic Meter (m³)", value: "m3", factor: 1 },
      { name: "Cubic Kilometer (km³)", value: "km3", factor: 1e9 },
      { name: "Cubic Centimeter (cm³)", value: "cm3", factor: 1e-6 },
      { name: "Cubic Millimeter (mm³)", value: "mm3", factor: 1e-9 },
      { name: "Liter (L)", value: "l", factor: 0.001 },
      { name: "Milliliter (mL)", value: "ml", factor: 1e-6 },
      { name: "US Gallon (gal)", value: "gal", factor: 0.00378541 },
      { name: "US Quart (qt)", value: "qt", factor: 0.000946353 },
      { name: "US Pint (pt)", value: "pt", factor: 0.000473176 },
      { name: "US Cup (cup)", value: "cup", factor: 0.000236588 },
      { name: "US Fluid Ounce (fl oz)", value: "floz", factor: 2.95735e-5 },
      { name: "US Tablespoon (tbsp)", value: "tbsp", factor: 1.47868e-5 },
      { name: "US Teaspoon (tsp)", value: "tsp", factor: 4.92892e-6 },
      { name: "Cubic Foot (ft³)", value: "ft3", factor: 0.0283168 },
      { name: "Cubic Inch (in³)", value: "in3", factor: 1.6387e-5 },
    ],
  },
  mass: {
    units: [
      { name: "Kilogram (kg)", value: "kg", factor: 1 },
      { name: "Gram (g)", value: "g", factor: 0.001 },
      { name: "Milligram (mg)", value: "mg", factor: 1e-6 },
      { name: "Metric Ton (t)", value: "t", factor: 1000 },
      { name: "Pound (lb)", value: "lb", factor: 0.453592 },
      { name: "Ounce (oz)", value: "oz", factor: 0.0283495 },
      { name: "Stone (st)", value: "st", factor: 6.35029 },
      { name: "US Ton (short ton)", value: "ust", factor: 907.185 },
      { name: "Imperial Ton (long ton)", value: "imt", factor: 1016.05 },
    ],
  },
  data: {
    units: [
      { name: "Bit (bit)", value: "bit", factor: 1 / 8e-6 },
      { name: "Byte (B)", value: "B", factor: 1e-6 },
      { name: "Kilobit (kb)", value: "kb", factor: 125e-6 },
      { name: "Kilobyte (KB)", value: "KB", factor: 0.001 },
      { name: "Megabit (Mb)", value: "Mb", factor: 0.125 },
      { name: "Megabyte (MB)", value: "MB", factor: 1 },
      { name: "Gigabit (Gb)", value: "Gb", factor: 125 },
      { name: "Gigabyte (GB)", value: "GB", factor: 1000 },
      { name: "Terabit (Tb)", value: "Tb", factor: 125000 },
      { name: "Terabyte (TB)", value: "TB", factor: 1e6 },
      { name: "Petabit (Pb)", value: "Pb", factor: 125e6 },
      { name: "Petabyte (PB)", value: "PB", factor: 1e9 },
    ],
  },
  speed: {
    units: [
      { name: "Meter per Second (m/s)", value: "mps", factor: 1 },
      { name: "Kilometer per Hour (km/h)", value: "kph", factor: 0.277778 },
      { name: "Mile per Hour (mph)", value: "mph", factor: 0.44704 },
      { name: "Knot (kn)", value: "kn", factor: 0.514444 },
      { name: "Foot per Second (ft/s)", value: "fps", factor: 0.3048 },
    ],
  },
  time: {
    units: [
      { name: "Second (s)", value: "s", factor: 1 },
      { name: "Millisecond (ms)", value: "ms", factor: 0.001 },
      { name: "Microsecond (μs)", value: "us", factor: 1e-6 },
      { name: "Nanosecond (ns)", value: "ns", factor: 1e-9 },
      { name: "Minute (min)", value: "min", factor: 60 },
      { name: "Hour (h)", value: "h", factor: 3600 },
      { name: "Day (d)", value: "d", factor: 86400 },
      { name: "Week (wk)", value: "wk", factor: 604800 },
      { name: "Month (mo)", value: "mo", factor: 2.628e6 },
      { name: "Year (yr)", value: "yr", factor: 3.154e7 },
    ],
  },
};

// Initialize the app
function initApp() {
  // Add event listeners
  converterType.addEventListener("change", updateUnitOptions);
  swapUnitsBtn.addEventListener("click", swapUnits);
  convertBtn.addEventListener("click", convertUnits);
  resetBtn.addEventListener("click", resetForm);
  inputUnit.addEventListener("change", validateUnitSelection);
  outputUnit.addEventListener("change", validateUnitSelection);
  inputValue.addEventListener("input", validateInput);

  // Initialize units for default converter type
  updateUnitOptions();
}

// Validate input value based on converter type
function validateInput() {
  const type = converterType.value;
  const value = parseFloat(inputValue.value);

  if (!allowsNegativeValues[type] && value < 0) {
    inputValue.value = 0;
    showToast("Negative values are not allowed for " + type, "warning");
  }
}

// Update unit options based on selected converter type
function updateUnitOptions() {
  const type = converterType.value;
  const units = unitData[type].units;

  // Clear previous options
  inputUnit.innerHTML = "";
  outputUnit.innerHTML = "";

  // Add new options
  units.forEach((unit, index) => {
    const inputOption = document.createElement("option");
    inputOption.value = unit.value;
    inputOption.textContent = unit.name;
    inputUnit.appendChild(inputOption);

    const outputOption = document.createElement("option");
    outputOption.value = unit.value;
    outputOption.textContent = unit.name;
    outputUnit.appendChild(outputOption);

    // Set default selections (different units)
    if (index === 0) {
      inputOption.selected = true;
    }
    if (index === 1) {
      outputOption.selected = true;
    }
  });

  // Clear input and output values
  inputValue.value = "";
  outputValue.value = "";

  // Set the input field's min attribute based on the converter type
  updateNegativeValueConstraint();
}

// Update the input field's ability to accept negative values based on the converter type
function updateNegativeValueConstraint() {
  const type = converterType.value;

  if (allowsNegativeValues[type]) {
    // Allow negative values
    inputValue.removeAttribute("min");
  } else {
    // Don't allow negative values
    inputValue.setAttribute("min", "0");
  }
}

// Swap input and output units
function swapUnits() {
  const tempUnit = inputUnit.value;
  inputUnit.value = outputUnit.value;
  outputUnit.value = tempUnit;

  // If there's a value, convert it after swapping
  if (inputValue.value) {
    convertUnits();
  }

  // Show toast notification
  showToast("Units swapped!", "info");
}

// Convert units
function convertUnits() {
  try {
    // Validate input
    if (!inputValue.value || inputValue.value === "") {
      showToast("Please enter a value to convert", "error");
      return;
    }

    // Check for same unit conversion
    if (inputUnit.value === outputUnit.value) {
      showToast("Cannot convert to the same unit", "warning");
      return;
    }

    const type = converterType.value;
    const value = parseFloat(inputValue.value);

    // Check if input is a valid number
    if (isNaN(value)) {
      showToast("Please enter a valid number", "error");
      return;
    }

    const fromUnit = inputUnit.value;
    const toUnit = outputUnit.value;

    let result;

    // Special case for temperature
    if (type === "temperature") {
      result = unitData.temperature.convert(value, fromUnit, toUnit);
    } else {
      // Validate that the units exist in our data
      const fromUnitData = unitData[type].units.find(
        (u) => u.value === fromUnit
      );
      const toUnitData = unitData[type].units.find((u) => u.value === toUnit);

      if (!fromUnitData || !toUnitData) {
        showToast("Invalid unit selection", "error");
        return;
      }

      const fromFactor = fromUnitData.factor;
      const toFactor = toUnitData.factor;

      // Check for division by zero
      if (toFactor === 0) {
        showToast("Cannot convert to this unit", "error");
        return;
      }

      result = (value * fromFactor) / toFactor;
    }

    // Check if result is valid
    if (isNaN(result) || !isFinite(result)) {
      showToast("Conversion resulted in an invalid value", "error");
      return;
    }

    // Format the result
    outputValue.value = formatResult(result);

    // Show success toast
    showToast("Conversion completed!", "success");
  } catch (error) {
    console.error("Conversion error:", error);
    showToast("An error occurred during conversion", "error");
  }
}

// Format result based on size
function formatResult(value) {
  try {
    if (value === 0) {
      return 0;
    }

    if (!isFinite(value) || isNaN(value)) {
      throw new Error("Invalid result value");
    }

    // For very small or very large numbers, use exponential notation
    if (Math.abs(value) < 0.000001 || Math.abs(value) > 1e9) {
      return value.toExponential(6);
    }

    // For regular numbers, fix to appropriate decimal places
    // Use different precision based on the magnitude
    if (Math.abs(value) < 0.01) {
      return parseFloat(value.toFixed(8));
    } else if (Math.abs(value) < 1) {
      return parseFloat(value.toFixed(6));
    } else if (Math.abs(value) < 100) {
      return parseFloat(value.toFixed(4));
    } else {
      return parseFloat(value.toFixed(2));
    }
  } catch (error) {
    console.error("Formatting error:", error);
    return "Error";
  }
}

// Reset the form
function resetForm() {
  inputValue.value = "";
  outputValue.value = "";

  // Reset to default units
  updateUnitOptions();

  // Show toast notification
  showToast("Form reset!", "info");
}

// Validate that input and output units are different
function validateUnitSelection() {
  if (inputUnit.value === outputUnit.value) {
    showToast("Please select different units", "warning");

    // If there are more than 2 options, select a different one
    const options = inputUnit.options;
    if (options.length > 2) {
      for (let i = 0; i < options.length; i++) {
        if (outputUnit.value !== options[i].value) {
          inputUnit.selectedIndex = i;
          break;
        }
      }
    }
  }
}

// Show toast notification
function showToast(message, type = "info") {
  // Clear any existing timeouts
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }

  // Set message and type
  let icon = "";
  switch (type) {
    case "success":
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case "error":
      icon = '<i class="fas fa-times-circle"></i>';
      break;
    case "warning":
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    case "info":
    default:
      icon = '<i class="fas fa-info-circle"></i>';
      break;
  }

  toast.innerHTML = icon + " " + message;
  toast.className = "toast " + type + " show";

  // Hide after 3 seconds
  toast.timeoutId = setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

// Call the init function when the page loads
document.addEventListener("DOMContentLoaded", initApp);
