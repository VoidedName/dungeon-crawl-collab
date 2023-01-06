export type BaseMap = {
  /**
   * Return the pathing distance between idx1 and idx2.
   */
  distance(idx1: number, idx2: number): number;
  /**
   * Return a list of idxs you can path to from here.
   * Does not have to be symmetric or continuous
   */
  exits(idx: number): number[];
  /**
   * Indicate if this tile blocks line of view
   */
  isOpaque(idx: number): boolean;
};
