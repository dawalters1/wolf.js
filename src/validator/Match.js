export const Match = {
  any (constructor) {
    return { __match_type: 'any', constructor };
  }
};

export default Match;
