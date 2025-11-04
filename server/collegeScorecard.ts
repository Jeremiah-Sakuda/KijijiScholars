// College Scorecard API integration
// API Documentation: https://collegescorecard.ed.gov/data/api-documentation/

const API_BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;

export interface CollegeScorecardSchool {
  id: number;
  "school.name": string;
  "school.city": string;
  "school.state": string;
  "school.school_url": string;
  "latest.admissions.admission_rate.overall"?: number;
  "latest.cost.tuition.in_state"?: number;
  "latest.cost.tuition.out_of_state"?: number;
  "latest.cost.avg_net_price.overall"?: number;
  "latest.completion.completion_rate_4yr_100nt"?: number;
  "latest.student.size"?: number;
  "latest.earnings.10_yrs_after_entry.median"?: number;
  "latest.admissions.sat_scores.average.overall"?: number;
  "latest.admissions.act_scores.midpoint.cumulative"?: number;
}

export interface CollegeScorecardResponse {
  metadata: {
    total: number;
    page: number;
    per_page: number;
  };
  results: CollegeScorecardSchool[];
}

/**
 * Search for universities in the College Scorecard database
 */
export async function searchUniversities(params: {
  name?: string;
  state?: string;
  page?: number;
  perPage?: number;
}): Promise<CollegeScorecardResponse> {
  if (!API_KEY) {
    throw new Error("COLLEGE_SCORECARD_API_KEY is not configured");
  }

  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    page: (params.page || 0).toString(),
    per_page: (params.perPage || 20).toString(),
    fields: [
      "id",
      "school.name",
      "school.city",
      "school.state",
      "school.school_url",
      "latest.admissions.admission_rate.overall",
      "latest.cost.tuition.in_state",
      "latest.cost.tuition.out_of_state",
      "latest.cost.avg_net_price.overall",
      "latest.completion.completion_rate_4yr_100nt",
      "latest.student.size",
      "latest.earnings.10_yrs_after_entry.median",
      "latest.admissions.sat_scores.average.overall",
      "latest.admissions.act_scores.midpoint.cumulative",
    ].join(","),
  });

  if (params.name) {
    queryParams.append("school.name", params.name);
  }

  if (params.state) {
    queryParams.append("school.state", params.state);
  }

  const url = `${API_BASE_URL}?${queryParams.toString()}`;
  console.log("[College Scorecard] Fetching:", url.replace(API_KEY, "***"));

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`College Scorecard API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get detailed information about a specific university by ID
 */
export async function getUniversityById(scorecardId: number): Promise<CollegeScorecardSchool | null> {
  if (!API_KEY) {
    throw new Error("COLLEGE_SCORECARD_API_KEY is not configured");
  }

  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    id: scorecardId.toString(),
    fields: [
      "id",
      "school.name",
      "school.city",
      "school.state",
      "school.school_url",
      "latest.admissions.admission_rate.overall",
      "latest.cost.tuition.in_state",
      "latest.cost.tuition.out_of_state",
      "latest.cost.avg_net_price.overall",
      "latest.completion.completion_rate_4yr_100nt",
      "latest.student.size",
      "latest.earnings.10_yrs_after_entry.median",
      "latest.admissions.sat_scores.average.overall",
      "latest.admissions.act_scores.midpoint.cumulative",
    ].join(","),
  });

  const url = `${API_BASE_URL}?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`College Scorecard API error: ${response.status} ${response.statusText}`);
  }

  const data: CollegeScorecardResponse = await response.json();
  return data.results[0] || null;
}

/**
 * Import universities from College Scorecard into our database format
 */
export function transformScorecardToUniversity(school: CollegeScorecardSchool) {
  return {
    scorecardId: school.id,
    name: school["school.name"],
    city: school["school.city"],
    state: school["school.state"],
    location: `${school["school.city"]}, ${school["school.state"]}`,
    websiteUrl: school["school.school_url"],
    acceptanceRate: school["latest.admissions.admission_rate.overall"] 
      ? Math.round(school["latest.admissions.admission_rate.overall"] * 100) 
      : null,
    tuitionInState: school["latest.cost.tuition.in_state"] || null,
    tuitionOutOfState: school["latest.cost.tuition.out_of_state"] || null,
    tuitionUSD: school["latest.cost.tuition.out_of_state"] || school["latest.cost.tuition.in_state"] || null,
    averageCostOfAttendance: school["latest.cost.avg_net_price.overall"] || null,
    completionRate: school["latest.completion.completion_rate_4yr_100nt"]
      ? Math.round(school["latest.completion.completion_rate_4yr_100nt"] * 100)
      : null,
    studentSize: school["latest.student.size"] || null,
    medianEarnings: school["latest.earnings.10_yrs_after_entry.median"] || null,
    satScoreAverage: school["latest.admissions.sat_scores.average.overall"] 
      ? Math.round(school["latest.admissions.sat_scores.average.overall"])
      : null,
    actScoreAverage: school["latest.admissions.act_scores.midpoint.cumulative"] || null,
  };
}
