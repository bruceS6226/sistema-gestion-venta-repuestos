export class Marca {
    public _id?: string;
    public name?: string;
    public image?: string;

    constructor(config: {
        _id?: string,
        name?: string,
        image?: string,
    }) {
        this._id = config._id;
        this.name = config.name;
        this.image = config.image;
    }
}

export class Modelo {
    public _id?: string;
    public name?: string;
    public brandName?: string;

    constructor(config: {
        _id?: string,
        name?: string,
        brandName?: string,
    }) {
        this._id = config._id;
        this.name = config.name;
        this.brandName = config.brandName;
    }
}

export class Tipo {
    public _id?: string;
    public name?: string;
    public modelName?: string;

    constructor(config: {
        _id?: string,
        name?: string,
        modelName?: string,
    }) {
        this._id = config._id;
        this.name = config.name;
        this.modelName = config.modelName;
    }
}