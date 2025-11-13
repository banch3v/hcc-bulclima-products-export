import axios from "axios";
import { parseStringPromise } from "xml2js";
import { ensureArray, extractPlainStrings, normalizeResult } from "./utils.js";
import fs from "fs";
import { writeToPath } from "@fast-csv/format";

const URL = "https://www.bulclima.com/tools/api/items/363";

export const fetchData = async () => {
  try {
    const response = await axios.get(URL);
    const result = await parseStringPromise(response.data, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });

    const productsNode = result.products?.product ?? result.product ?? [];

    const productList = Array.isArray(productsNode)
      ? productsNode
      : [productsNode];

    const products = productList.map((product) => {
      const imagesNode = product.images ?? product.image ?? null;
      const imagesArray = imagesNode
        ? ensureArray(imagesNode.image ?? imagesNode) // image can be nested or direct
        : [];

      const images = imagesArray.reduce((acc, curr) => {
        if (curr) acc = acc + String(curr).trim() + ",";

        return acc;
      }, "");

      const brandName =
        product.brands?.brand?.name ??
        product.brand?.name ??
        (Array.isArray(product.brands?.brand)
          ? product.brands.brand[0]?.name
          : undefined) ??
        null;

      const shortDescriptionToArray = extractPlainStrings(
        product.short_description ?? ""
      );

      const productTechData = shortDescriptionToArray.reduce((acc, curr) => {
        const key = curr.split(":")[0]?.trim();
        const value = curr.split(":").slice(1).join(":").trim();

        return {
          ...acc,
          [key]: value,
        };
      }, {});

      return {
        id: product.id ?? product.ID ?? null,
        sku: product.product_code ?? product.sku ?? null,
        name: product.title ?? product.name ?? null,
        price: product.price ?? null,
        description: product.description ?? null,
        brand: brandName,
        type: product.category ?? null,
        category: product.sub_category ?? null,
        images,
        // ...productTechData,
      };
    });

    return products;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

function generateCSV(result) {
  const outputDir = "./output/";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\.\d{3}Z$/, "");

  const normalizedResults = result;

  writeToPath(`${outputDir}products-${timestamp}.csv`, normalizedResults, {
    headers: true,
  })
    .on("finish", () => {
      console.log("CSV file written successfully");
    })
    .on("error", (err) => {
      console.error("Error writing CSV file:", err);
    });
}

const run = async () => {
  const data = await fetchData();
  generateCSV(data);
};

run();
