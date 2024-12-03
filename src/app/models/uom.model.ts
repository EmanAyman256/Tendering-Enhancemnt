export class UnitOfMeasure {

    public UnitOfMeasureSAPCode: string;
    public UnitOfMeasureLongName: string;
    public UnitOfMeasureName: string;
  
    constructor(UnitOfMeasureSAPCode: string, UnitOfMeasureLongName: string, UnitOfMeasureName: string) {
      this.UnitOfMeasureSAPCode = UnitOfMeasureSAPCode;
      this.UnitOfMeasureLongName = UnitOfMeasureLongName;
      this.UnitOfMeasureName = UnitOfMeasureName;
    }
  }