import { Link, useParams } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import * as am5index from "@amcharts/amcharts5/index";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import am5geodata_ukLow from "@amcharts/amcharts5-geodata/ukLow";
import am5geodata_canadaLow from "@amcharts/amcharts5-geodata/canadaLow";
import am5geodata_australiaLow from "@amcharts/amcharts5-geodata/australiaLow";
import am5geodata_germanyLow from "@amcharts/amcharts5-geodata/germanyLow";
import am5geodata_franceLow from "@amcharts/amcharts5-geodata/franceLow";
import am5geodata_italyLow from "@amcharts/amcharts5-geodata/italyLow";
import am5geodata_spainLow from "@amcharts/amcharts5-geodata/spainLow";
import am5geodata_brazilLow from "@amcharts/amcharts5-geodata/brazilLow";
import am5geodata_argentinaLow from "@amcharts/amcharts5-geodata/argentinaLow";
import am5geodata_mexicoLow from "@amcharts/amcharts5-geodata/mexicoLow";
import am5geodata_chinaLow from "@amcharts/amcharts5-geodata/chinaLow";
import am5geodata_indiaLow from "@amcharts/amcharts5-geodata/indiaLow";
import am5geodata_russiaLow from "@amcharts/amcharts5-geodata/russiaLow";
import am5geodata_southKoreaLow from "@amcharts/amcharts5-geodata/southKoreaLow";
import am5geodata_saudiArabiaLow from "@amcharts/amcharts5-geodata/saudiArabiaLow";
import am5geodata_turkeyLow from "@amcharts/amcharts5-geodata/turkeyLow";
import am5geodata_southAfricaLow from "@amcharts/amcharts5-geodata/southAfricaLow";
import COUNTRIES from "../data/data.json";
import { getRegionSentiment } from "../utils/getCountrySentiment";

const CountryPage = () => {
  const { country } = useParams();
  const [error, setError] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    let geoData = undefined;
    switch (country) {
      case "United States":
        geoData = am5geodata_usaLow;
        break;
      case "United Kingdom":
        geoData = am5geodata_ukLow;
        break;
      case "Canada":
        geoData = am5geodata_canadaLow;
        break;
      case "Australia":
        geoData = am5geodata_australiaLow;
        break;
      case "Germany":
        geoData = am5geodata_germanyLow;
        break;
      case "France":
        geoData = am5geodata_franceLow;
        break;
      case "Italy":
        geoData = am5geodata_italyLow;
        break;
      case "Spain":
        geoData = am5geodata_spainLow;
        break;
      case "Brazil":
        geoData = am5geodata_brazilLow;
        break;
      case "Argentina":
        geoData = am5geodata_argentinaLow;
        break;
      case "Mexico":
        geoData = am5geodata_mexicoLow;
        break;
      case "China":
        geoData = am5geodata_chinaLow;
        break;
      case "India":
        geoData = am5geodata_indiaLow;
        break;
      case "Russia":
        geoData = am5geodata_russiaLow;
        break;
      case "South Korea":
        geoData = am5geodata_southKoreaLow;
        break;
      case "Saudi Arabia":
        geoData = am5geodata_saudiArabiaLow;
        break;
      case "Turkey":
        geoData = am5geodata_turkeyLow;
        break;
      case "South Africa":
        geoData = am5geodata_southAfricaLow;
        break;
      default:
        setError("Country not found");
        return;
    }
    // Create root
    const root = am5index.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
      })
    );

    // Create polygon series
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: geoData,
        valueField: "value",
        calculateAggregates: true,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}: {value}",
    });

    polygonSeries.set("heatRules", [
      {
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5index.color(0xff621f),
        max: am5index.color(0x661f00),
        key: "fill",
      },
    ]);

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
    });

    const countryData = COUNTRIES.filter(
      (country) => country.Country === country
    );
    polygonSeries.data.setAll(countryData);

    let previousPolygon: any;
    polygonSeries.mapPolygons.template.on("active", (active, target) => {
      if (previousPolygon && previousPolygon !== target) {
        previousPolygon.set("active", false);
        target?.set("fill", root.interfaceColors.get("primaryButton"));
      }
      if (target?.get("active")) {
        const regionName = (
          target.dataItem?.dataContext as unknown as {
            name: string;
          }
        )?.name;

        const countrySentiment = getRegionSentiment(regionName);
        target.set("fill", countrySentiment);
      } else {
        target?.set("fill", root.interfaceColors.get("primaryButton"));
        previousPolygon?.set("active", false);
      }
      previousPolygon = target;
    });
    // Add zoom control
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-pan-zoom/#Zoom_control
    const zoomControl = chart.set(
      "zoomControl",
      am5map.ZoomControl.new(root, {})
    );
    zoomControl.homeButton.set("visible", true);

    // Set clicking on "water" to zoom out
    chart.chartContainer?.get("background")?.events.on("click", () => {
      chart.goHome();
    });

    // Make stuff animate on load
    chart.appear(1000, 100);
    return () => {
      root.dispose();
    };
  }, [country]);
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-[95vh] w-[100vw]">
        {error && (
          <div className="text-red-500 text-center text-2xl font-bold">
            {error}
          </div>
        )}
        <div id="chartdiv" className="w-[100vw] h-[95vh]" />
      </div>
      <div className="w-[100vw] h-[5vh] flex justify-center items-center">
        <Link to="/">Back to Map</Link>
      </div>
    </div>
  );
};

export default CountryPage;
