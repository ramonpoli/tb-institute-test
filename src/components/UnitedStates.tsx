import { useLayoutEffect } from "react";
import * as am5index from "@amcharts/amcharts5/index";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import COUNTRIES from "../data/data.json";
import { getRegionSentiment } from "../utils/getCountrySentiment";

const UnitedStates = () => {
  useLayoutEffect(() => {
    // Create root
    const root = am5index.Root.new("chartdiv");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "none",
        projection: am5map.geoAlbersUsa(),
      })
    );

    // Create polygon series
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_usaLow,
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

    polygonSeries.data.setAll(
      COUNTRIES.filter((country) => country.Country === "United States")
    );

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
    // Make stuff animate on load
    chart.appear(1000, 100);
    return () => {
      root.dispose();
    };
  }, []);
  return <div id="chartdiv" className="w-[100vw] h-[95vh]" />;
};

export default UnitedStates;
