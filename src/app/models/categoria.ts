export class Categoria {
    public _id?: string;
    public name?: string;
    public title?: string;

    constructor(config: {
        _id?: string,
        name?: string,
        title?: string,
    }) {
        this._id = config._id;
        this.name = config.name;
        this.title = config.title;
    }
}