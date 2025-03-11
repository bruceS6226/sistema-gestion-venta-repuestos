export class Usuario {
    public _id?: string;
    public userName?: string;
    public email?: string;
    public password?: string;
    public isActive?: boolean;
    public roles?: string[];
    public isEmailConfirmated?: boolean;
    public confirmationToken?: boolean;

    constructor(config: {
        _id?: string,
        userName?: string,
        email?: string,
        password?: string,
        roles?: string[],
    }) {
        this._id = config._id;
        this.userName = config.userName;
        this.email = config.email;
        this.password = config.password;
        this.roles = config.roles;
    }
}

export class DetallesUsuario {
    _id?: string;
    userID?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    province?: string;
    identityDocumentNumber?: string;
    identityDocumentType?: string;

    constructor(config: {
        _id?: string;
        userID?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        postalCode?: string;
        city?: string;
        province?: string;
        identityDocumentNumber?: string;
        identityDocumentType?: string;
    }) {
        this._id = config._id;
        this.userID = config.userID;
        this.firstName = config.firstName;
        this.lastName = config.lastName;
        this.phone = config.phone;
        this.address = config.address;
        this.postalCode = config.postalCode;
        this.city = config.city;
        this.province = config.province;
        this.identityDocumentNumber = config.identityDocumentNumber;
        this.identityDocumentType = config.identityDocumentType;
    }
}

export class Items {
    code?: string;
    quantity?: number;

    constructor(config: {
        code?: string;
        quantity?: number;
    }) {
        this.code = config.code;
        this.quantity = config.quantity;
    }
}
export class OrdenCompra {
    _id?: string;
    userDetailID?: string;
    items?: Items[];

    constructor(config: {
        _id?: string;
        userDetailID?: string;
        items?: Items[];
    }) {
        this._id = config._id;
        this.userDetailID = config.userDetailID;
        this.items = config.items;
    }
}

export class Pago {
    orderID?: string;
    successURL?: string;
    cancelURL?: string;
    tax?: number;

    constructor(config: {
        orderID?: string;
        successURL?: string;
        cancelURL?: string;
        tax?: number;
    }) {
        this.orderID = config.orderID;
        this.successURL = config.successURL;
        this.cancelURL = config.cancelURL;
        this.tax = config.tax;
    }
}