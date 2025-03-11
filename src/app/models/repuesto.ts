export class Repuesto {
    public _id?: string;
    public code?: string;
    public name?: string;
    public description?: string;
    public stock?: number;
    public price?: number;
    public category?: string;
    public images?: string[];
    public brand?: string;
    public brandModel?: string;
    public modelType?: string;
    public modelTypeYear?: string;
    public createdAt?: Date;
    public updatedAt?: string;
    public createdBy?: string;

    constructor(config: {
        _id?: string,
        code?: string,
        name?: string,
        description?: string,
        stock?: number,
        price?: number,
        category?: string,
        images?: string[],
        brand?: string,
        brandModel?: string,
        modelType?: string,
        modelTypeYear?: string,
        createdAt?: Date,
        updatedAt?: string,
        createdBy?: string,
    }) {
        this._id = config._id;
        this.code = config.code;
        this.name = config.name;
        this.description = config.description;
        this.stock = config.stock;
        this.price = config.price;
        this.category = config.category;
        this.images = config.images;
        this.brand = config.brand;
        this.brandModel = config.brandModel;
        this.modelType = config.modelType;
        this.modelTypeYear = config.modelTypeYear;
        this.createdAt = config.createdAt;
        this.updatedAt = config.updatedAt;
        this.createdBy = config.createdBy;
    }
}
