import * as am5index from "@amcharts/amcharts5/index";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect } from "react";
import COUNTRIES from "../data/data.json";
import { useNavigate } from "react-router-dom";
import { getCountrySentiment } from "../utils/getCountrySentiment";

const MapChart = () => {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    const mapCountries = COUNTRIES.reduce((acc, curr) => {
      if (!acc.find((country) => country === curr.Country)) {
        acc.push(curr.Country);
      }
      return acc;
    }, [] as string[]);

    /* Chart code */
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    const root = am5index.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create the map chart
    // https://www.amcharts.com/docs/v5/charts/map-chart/
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        projection: am5map.geoMercator(),
      })
    );

    // Create main polygon series for countries
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"],
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
    });

    polygonSeries.set("heatRules", [
      {
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        key: "fill",
        customFunction: (sprite: am5index.Sprite) => {
          const countryName = (
            sprite.dataItem?.dataContext as unknown as {
              name: string;
            }
          )?.name;
          return getCountrySentiment(countryName);
        },
      },
    ]);

    let previousPolygon: any;

    polygonSeries.mapPolygons.template.on("active", (active, target) => {
      if (previousPolygon && previousPolygon !== target) {
        previousPolygon.set("active", false);
        target?.set("fill", root.interfaceColors.get("primaryButton"));
      }
      if (target?.get("active")) {
        const countryName = (
          target.dataItem?.dataContext as unknown as {
            name: string;
          }
        )?.name;
        if (mapCountries.includes(countryName)) {
          setTimeout(() => {
            navigate(`/country/${countryName}`);
          }, 1000);
        }
        polygonSeries.zoomToDataItem(target.dataItem as any);

        const countrySentiment = getCountrySentiment(countryName);
        target.set("fill", countrySentiment);
      } else {
        target?.set("fill", root.interfaceColors.get("primaryButton"));
        previousPolygon.set("active", false);
        chart.goHome();
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
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div id="chartdiv" className="w-[100vw] h-[95vh]" />
      <div className="w-[100vw] h-[5vh]">
        <div className="flex justify-center items-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2" />
            <span>High Sentiment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 mr-2" />
            <span>Neutral Sentiment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 mr-2" />
            <span>No Data</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2" />
            <span>Low Sentiment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapChart;
