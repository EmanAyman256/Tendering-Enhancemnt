
export class ServiceInfo {
    public serviceNumberCode!: number;
    public searchTerm: string;
    public description: string;
    public serviceText: string;
    public shortTextChangeAllowed: boolean;
    public deletionIndicator: boolean;
    public mainItem: boolean;
    public numberToBeConverted: number;
    public convertedNumber: number;
    public serviceTypeCode: string;
    public materialGroupCode: string;
    public baseUnitOfMeasurement: string;
    public toBeConvertedUnitOfMeasurement: string
    public defaultUnitOfMeasurement: string;
  
    constructor(searchTerm: string, description: string, serviceText: string, shortTextChangeAllowed: boolean, deletionIndicator: boolean, mainItem: boolean,
      numberToBeConverted: number,
      convertedNumber: number,
      serviceTypeCode: string, materialGroupCode: string,
      baseUnitOfMeasurement: string, toBeConvertedUnitOfMeasurement: string,
      defaultUnitOfMeasurement: string
    ) {
      this.searchTerm = searchTerm;
      this.description = description;
      this.serviceText = serviceText;
      this.shortTextChangeAllowed = shortTextChangeAllowed;
      this.deletionIndicator = deletionIndicator;
      this.mainItem = mainItem;
      this.numberToBeConverted = numberToBeConverted;
      this.convertedNumber = convertedNumber;
      this.serviceTypeCode = serviceTypeCode;
      this.materialGroupCode = materialGroupCode;
      this.baseUnitOfMeasurement = baseUnitOfMeasurement;
      this.toBeConvertedUnitOfMeasurement = toBeConvertedUnitOfMeasurement;
      this.defaultUnitOfMeasurement = defaultUnitOfMeasurement;
    }
  }