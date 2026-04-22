export function getWeatherLabel(code: number | null | undefined) {
    switch (code) {
      case 0:
        return "Clear sky";
      case 1:
      case 2:
      case 3:
        return "Cloudy";
      case 45:
      case 48:
        return "Fog";
      case 51:
      case 53:
      case 55:
        return "Drizzle";
      case 56:
      case 57:
        return "Freezing drizzle";
      case 61:
      case 63:
      case 65:
        return "Rain";
      case 66:
      case 67:
        return "Freezing rain";
      case 71:
      case 73:
      case 75:
        return "Snow";
      case 77:
        return "Snow grains";
      case 80:
      case 81:
      case 82:
        return "Rain showers";
      case 85:
      case 86:
        return "Snow showers";
      case 95:
        return "Thunderstorm";
      case 96:
      case 99:
        return "Thunderstorm with hail";
      default:
        return "Unknown weather";
    }
  }
  
  export function getWeatherEmoji(code: number | null | undefined) {
    switch (code) {
      case 0:
        return "☀️";
      case 1:
      case 2:
      case 3:
        return "☁️";
      case 45:
      case 48:
        return "🌫️";
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return "🌦️";
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return "🌧️";
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return "🌨️";
      case 95:
      case 96:
      case 99:
        return "⛈️";
      default:
        return "🌍";
    }
  }