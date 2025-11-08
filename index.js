import axios from "axios";
import { parseStringPromise } from "xml2js";
import { stripHtml, extractPlainStrings } from "./utils.js";

const URL = "https://www.bulclima.com/tools/api/items/137";

const ensureArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

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
        images,
        brand: brandName,
        ...productTechData,
      };
    });

    return products;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

fetchData().then((data) => console.log(data));
