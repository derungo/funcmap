import { AITag } from '../parser/aiTagParser';

export interface IStorage {
    getFunctionData(functionName: string): Promise<AITag | null>;
    findDependentFunctions(functionName: string): Promise<AITag[]>;
    findRelatedFunctions(moduleName: string): Promise<AITag[]>;
    findFunctionsByExecToken(token: string): Promise<AITag[]>;
    searchFunctions(query: string): Promise<AITag[]>;
    getAllFunctions(): Promise<AITag[]>;
    saveToStorage(tags: AITag[]): Promise<void>;
} 