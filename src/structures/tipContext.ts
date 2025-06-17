import { ContextType } from '../constants/ContextType.ts';

export type TipContext = {
  type: ContextType | string,
  id: number | undefined
}

export default TipContext;
