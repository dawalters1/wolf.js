import { ContextType } from '../constants/ContextType.ts';

export interface TipContext {

    type: ContextType | string,
    id: number | undefined
}

export default TipContext;
