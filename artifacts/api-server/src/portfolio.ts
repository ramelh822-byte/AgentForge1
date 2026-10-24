import { buildPortfolioSummary } from './opportunity-engine.js';

export const getPortfolio = () => buildPortfolioSummary();
export const getAssetMatrix = () => buildPortfolioSummary().assets;
export const getRecommendations = () => buildPortfolioSummary().opportunities;
