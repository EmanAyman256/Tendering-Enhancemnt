export interface SubItem {

    Type:string;

    invoiceSubItemCode?: number;
    serviceNumberCode?: number;
    description?: string;
    quantity?: number;
    unitOfMeasurementCode?:string;
    formulaCode?:string;
    amountPerUnit?: number;
    currencyCode?: string;
    total?: number;
    selected?: boolean;

   
}

export interface MainItem{
    Type?:string;

    invoiceMainItemCode: number;
    serviceNumberCode?: number;
    description?: string;
    quantity?: number;
    unitOfMeasurementCode?:string;
    formulaCode?:string;
    amountPerUnit?: number;
    currencyCode?: string;
    total?: number;
    profitMargin?: number;
    totalWithProfit: number;
    selected?: boolean;
    subItems?:SubItem[];
    
    doNotPrint?:boolean;
    amountPerUnitWithProfit?: number;
}
