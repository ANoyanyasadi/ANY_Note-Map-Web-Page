import { gotoIcon, homeIcon, jobIcon, parkIcon } from "./constants.js";

//! Status değerine bağlı olarak dinamik doğru icon'u return eden Fonskyon
function getIcon(status) {
  switch (status) {
    case "goto":
      return gotoIcon;

    case "home":
      return homeIcon;

    case "job":
      return jobIcon;

    case "park":
      return parkIcon;

    default:
      return undefined;
  }
}

export default getIcon;

//! Status değerinin Türkçe karşılığını return eden Fonksyon
export function getStatus(status) {
  switch (status) {
    case "goto":
      return "Ziyaret";

    case "home":
      return "Ev";

    case "job":
      return "İş";

    case "park":
      return "Park";

    default:
      return "Önemsiz";
  }
}