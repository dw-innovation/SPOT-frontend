import { ClientErrorPayload } from "@/types/errorReport";
import { SpotQuery } from "@/types/spotQuery";

export const fetchOSMData = async ({
  spotQuery,
}: {
  spotQuery: SpotQuery;
}): Promise<any> => {
  const response = await fetch("/api/queryOSM", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spotQuery),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No data returned from API");
  }
  return response.json();
};

export const fetchGeocodeApiData = async (address: string): Promise<any> => {
  if (!address) return;

  try {
    const response = await fetch(
      `/api/geocode?address=${encodeURIComponent(address)}`
    );
    if (!response.ok) return null;

    const data = await response.json();
    return data.features;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const fetchNLToSpotQueryTransformation = async (
  naturalLanguagePrompt: string
): Promise<any> => {
  const response = await fetch("/api/transformSentence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence: naturalLanguagePrompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "UnknownError");
  }

  return response.json();
};

export const validateSpotQuery = async (spotQuery: SpotQuery): Promise<any> => {
  const response = await fetch("/api/validateQuery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spotQuery),
  });

  if (!response.ok) {
    throw new Error("spotQueryInvalid");
  }

  return response.json();
};

export const fetchAreas = async (area: string): Promise<any> => {
  const params = new URLSearchParams({
    q: area,
    format: "json",
    polygon_geojson: "1",
    "accept-language": "en",
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NOMINATIM_API}?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch areas");
  }

  const data = await response.json();
  return data.filter((item: any) => item.geojson.type !== "Point");
};

export const getSession = async (id: string) => {
  const auth = process.env.HTTP_BASIC_AUTH?.split(":") || [];
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const params = new URLSearchParams({ id });

  const response = await fetch(`${baseUrl}/api/getSession?${params}`, {
    headers: {
      Authorization: `Basic ${btoa(`${auth[0] || ""}:${auth[1] || ""}`)}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }

  const res = await response.json();
  return { props: { data: res.data } };
};

const fetchOSMValues = async (
  key: string,
  page: number,
  resultsPerPage: number
) => {
  const params = new URLSearchParams({
    key,
    page: String(page),
    rp: String(resultsPerPage),
    sortname: "count_ways",
    sortorder: "desc",
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TAG_INFO_API}/key/values?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch OSM values");
  }

  return response.json();
};

export const getOSMValueOptions = async (key: string) => {
  const resultsPerPage = 999;

  const initialData = await fetchOSMValues(key, 1, resultsPerPage);

  let options = initialData.data.map((option: any) => ({
    label: option.value,
    value: option.value,
  }));

  return options;
};

export const fetchTagInfo = async (key: string) => {
  const params = new URLSearchParams({
    key,
    rp: "200",
    sortname: "count_all",
    sortorder: "desc",
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TAG_INFO_API}/key/values?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch tag info");
  }

  return response.json();
};

export const trackError = async (
  payload: ClientErrorPayload
): Promise<{ status: string; id?: string } | undefined> => {
  try {
    const response = await fetch("/api/trackError", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        route: typeof window !== "undefined" ? window.location.pathname : undefined,
        ...payload,
      }),
      keepalive: true,
    });
    return response.json();
  } catch (e) {
    // Reporting must never throw into the UI.
    console.error("trackError failed:", e);
    return undefined;
  }
};
