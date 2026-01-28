export const SCORE_SCALE = {
    RAW_MAX: 10,
    NORMALIZED_MAX: 100,
    MULTIPLIER: 10
};

export const THRESHOLDS = {
    PASS_NORMAL: 50,
    PASS_BOSS: 60,
    PROMOTION: 60,
    LOW_SCORE: 50,
    CLEAR_FUNDAMENTAL: 55
};

export function normalizeScore(rawScore) {
    return rawScore * SCORE_SCALE.MULTIPLIER;
}
