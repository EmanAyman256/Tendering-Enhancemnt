export class Formula {
  public formulaCode!:number;
    public formula: string;
    public description: string;
    public numberOfParameters: number;
    public formulaLogic: string;
   public result!: number
    constructor(formula:string,description: string, numberOfParameters: number,formulaLogic: string
    ) {
        this.formula = formula;
      this.description=description;
      this.numberOfParameters=numberOfParameters;
      this.formulaLogic=formulaLogic;
    }
}