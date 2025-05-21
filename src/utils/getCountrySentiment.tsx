import COUNTRIES from "../data/data.json";

const getCountrySentiment = (countryName: string) => {
  const countryRegions = COUNTRIES.filter(
    (country) => country.Country === countryName
  );
  if (countryRegions.length === 0) {
    return "gray";
  }
  const countrySentiment = countryRegions.reduce((acc, curr) => {
    return acc + (curr.RandomValue === 2 ? 1 : curr.RandomValue === 0 ? -1 : 0);
  }, 0);

  if (countrySentiment === undefined) {
    return "gray";
  }
  if (countrySentiment > 0) {
    return "green";
  }
  if (countrySentiment < 0) {
    return "red";
  }
  if (countrySentiment === 0) {
    return "yellow";
  }
  return "gray";
};

const getRegionSentiment = (regionName: string) => {
  const region = COUNTRIES.find((country) => country.Region === regionName);
  if (region?.RandomValue === 2) {
    return "green";
  }
  if (region?.RandomValue === 0) {
    return "red";
  }
  if (region?.RandomValue === 1) {
    return "yellow";
  }
  return "gray";
};
export { getCountrySentiment, getRegionSentiment };
