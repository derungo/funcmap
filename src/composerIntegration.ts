import { IStorage } from './storage/storage';
import { AITag } from './parser/aiTags';

export interface IComposerIntegration {
    getFunctionData(functionName: string): Promise<AITag | null>;
    findDependentFunctions(functionName: string): Promise<AITag[]>;
    findRelatedFunctions(moduleName: string): Promise<AITag[]>;
    findFunctionsByExecToken(token: string): Promise<AITag[]>;
    searchFunctions(query: string): Promise<AITag[]>;
    getAllFunctions(): Promise<AITag[]>;
}

export class ComposerIntegration implements IComposerIntegration {
    constructor(private storage: IStorage) {}

    async getFunctionData(functionName: string): Promise<AITag | null> {
        return await this.storage.getFunctionData(functionName);
    }

    async findDependentFunctions(functionName: string): Promise<AITag[]> {
        return await this.storage.findDependentFunctions(functionName);
    }

    async findRelatedFunctions(moduleName: string): Promise<AITag[]> {
        return await this.storage.findRelatedFunctions(moduleName);
    }

    async findFunctionsByExecToken(token: string): Promise<AITag[]> {
        return await this.storage.findFunctionsByExecToken(token);
    }

    async searchFunctions(query: string): Promise<AITag[]> {
        return await this.storage.searchFunctions(query);
    }

    async getAllFunctions(): Promise<AITag[]> {
        return await this.storage.getAllFunctions();
    }
}

// Global declaration for TypeScript
declare global {
    var funcmapForComposer: IComposerIntegration;
} 