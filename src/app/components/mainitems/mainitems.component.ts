import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Formula } from 'src/app/models/formulas.model';
import { MainItem, SubItem } from 'src/app/models/Mainitem.model';
import { ServiceInfo } from 'src/app/models/Services.model';
import { UnitOfMeasure } from 'src/app/models/uom.model';
import { ApiServiceService } from 'src/app/services/api-service.service';
import * as FileSaver from 'file-saver';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-mainitems',
  templateUrl: './mainitems.component.html',
  styleUrls: ['./mainitems.component.css'],
  providers:[MessageService,ConfirmationService]
})
export class MainitemsComponent implements OnInit {
  
 // Pagination:
 loading: boolean = true;
 loadingSubItems: boolean = true;

 searchKey: string = ""
 currency: any
 totalValue: number = 0.0
 //fields for dropdown lists
 recordsServiceNumber!: ServiceInfo[];

 selectedServiceNumberRecord?: ServiceInfo
 selectedServiceNumber!: number;
 updateSelectedServiceNumber!: number
 updateSelectedServiceNumberRecord?: ServiceInfo
 shortText: string = '';
 updateShortText: string = '';
 shortTextChangeAllowed: boolean = false;
 updateShortTextChangeAllowed: boolean = false;

 // service number for subitem :
 selectedServiceNumberRecordSubItem?: ServiceInfo
 selectedServiceNumberSubItem!: number;
 updateSelectedServiceNumberSubItem!: number;
 updateSelectedServiceNumberRecordSubItem?: ServiceInfo
 shortTextSubItem: string = '';
 updateShortTextSubItem: string = '';
 shortTextChangeAllowedSubItem: boolean = false;
 updateShortTextChangeAllowedSubItem: boolean = false;

 recordsFormula!: any[];

 selectedFormula!: string;
 selectedFormulaRecord: any
 updatedFormula!: number;
 updatedFormulaRecord: any

 // formula for subitem :
 selectedFormulaSubItem!: string;
 selectedFormulaRecordSubItem: any
 updatedFormulaSubItem!: number;
 updatedFormulaRecordSubItem: any

 recordsUnitOfMeasure: UnitOfMeasure[] = [];
 selectedUnitOfMeasure!: string;

 // uom for subitem:
 selectedUnitOfMeasureSubItem!: string;

 recordsCurrency!: any[];
 selectedCurrency: string = "";
 // currency for subitem:
 selectedCurrencySubItem!: string;
 //
 selectedRowsForProfit: MainItem[] = []; // Array to store selected rows
 profitMarginValue: number = 0;

 public rowIndex = 0;
 expandedRows: { [key: number]: boolean } = {};
 mainItemsRecords: MainItem[] = [];
 subItemsRecords: SubItem[] = [];
 updateProfitMargin(value: number) {
  console.log(value);

  if (value !== null && value < 0) {
    this.profitMarginValue = 0; // Reset to 0 
   // alert('Negative values are not allowed');
   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Negative values are not allowed', life: 4000 });
  } else {

    for (const row of this.selectedRowsForProfit) {
      row.profitMargin = value;
      const { invoiceMainItemCode, total, totalWithProfit, ...mainItemWithoutMainItemCode } = row;
      const updatedMainItem = this.removePropertiesFrom(mainItemWithoutMainItemCode, ['invoiceMainItemCode', 'invoiceSubItemCode']);
      console.log(updatedMainItem);

      const newRecord: MainItem = {
        ...updatedMainItem, // Copy all properties from the original record
        // Modify specific attributes
        subItems: (row?.subItems ?? []).map(subItem =>
          this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
        ),
        profitMargin: value

      };
      console.log(newRecord);
      const updatedRecord = this.removeProperties(newRecord, ['selected'])
      this.Apiservice.patchMainItem<MainItem>(row.invoiceMainItemCode, updatedRecord).subscribe(response => {
        console.log('mainitem updated :', response);
        this.totalValue = 0;
        this.ngOnInit();
      });

    }
  }
}
constructor(private Apiservice:ApiServiceService,private messageService: MessageService, private confirmationService: ConfirmationService){}

ngOnInit() {
    this.Apiservice.getServices<ServiceInfo[]>().subscribe(response => {
      this.recordsServiceNumber = response
    });
    this.Apiservice.getFormula<any[]>().subscribe(response => {
      this.recordsFormula = response;
    });
    this.Apiservice.getCurrency<any[]>().subscribe(response => {
      this.recordsCurrency = response;
    });
    this.Apiservice.getMainItems<MainItem[]>().subscribe(response => {
      this.mainItemsRecords = response.sort((a, b) => a.invoiceMainItemCode - b.invoiceMainItemCode);
      //response.sort((a, b) => b.invoiceMainItemCode - a.invoiceMainItemCode);
      console.log(this.mainItemsRecords);
      this.loading = false;

      this.totalValue = this.mainItemsRecords.reduce((sum, record) => sum + record.totalWithProfit, 0);
      console.log('Total Value:', this.totalValue);
    });
    this.Apiservice.getSubItems<SubItem[]>().subscribe(response => {
      this.subItemsRecords = response;
      this.loadingSubItems=false;
    });
}
removePropertiesFrom(obj: any, propertiesToRemove: string[]): any {
  const newObj: any = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (Array.isArray(obj[key])) {
        // If the property is an array, recursively remove properties from each element
        newObj[key] = obj[key].map((item: any) => this.removeProperties(item, propertiesToRemove));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // If the property is an object, recursively remove properties from the object
        newObj[key] = this.removeProperties(obj[key], propertiesToRemove);
      } else if (!propertiesToRemove.includes(key)) {
        // Otherwise, copy the property if it's not in the list to remove
        newObj[key] = obj[key];
      }
    }
  }

  return newObj;
}
removeProperties(obj: any, propertiesToRemove: string[]): any {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (!propertiesToRemove.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}
// to handel checkbox selection:
selectedMainItems: MainItem[] = [];
selectedSubItems: SubItem[] = [];
onMainItemSelection(event: any, mainItem: MainItem) {
  mainItem.selected = event.checked;
  this.selectedMainItems = event.checked
  if (mainItem.selected) {
    if (mainItem.subItems && mainItem.subItems.length > 0) {
      mainItem.subItems.forEach(subItem => subItem.selected = !subItem.selected);
    }
  }
  else {
    // User deselected the record, so we need to deselect all associated subitems
    if (mainItem.subItems && mainItem.subItems.length > 0) {
      mainItem.subItems.forEach(subItem => subItem.selected = false)
      console.log(mainItem.subItems);
    }
  }
  // For Profit Margin:
  if (event.checked) {
    this.selectedRowsForProfit.push(mainItem);
    console.log(this.selectedRowsForProfit);

  } else {
    const index = this.selectedRowsForProfit.indexOf(mainItem);
    if (index !== -1) {
      this.selectedRowsForProfit.splice(index, 1);
      console.log(this.selectedRowsForProfit);
    }
  }
}
// to handle All Records Selection / Deselection 
selectedAllRecords: MainItem[] = [];
onSelectAllRecords(event: any): void {
  if (Array.isArray(event.checked) && event.checked.length > 0) {
    this.selectedAllRecords = [...this.mainItemsRecords];
    console.log(this.selectedAllRecords);
  } else {
    this.selectedAllRecords = [];
  }
}

onSubItemSelection(event: any, subItem: SubItem) {
  console.log(subItem);
  this.selectedSubItems.push(subItem);
}
//In Creation to handle shortTextChangeAlowlled Flag 
onServiceNumberChange(event: any) {
  const selectedRecord = this.recordsServiceNumber.find(record => record.serviceNumberCode === this.selectedServiceNumber);
  if (selectedRecord) {
    this.selectedServiceNumberRecord = selectedRecord
    this.shortTextChangeAllowed = this.selectedServiceNumberRecord?.shortTextChangeAllowed || false;
    this.shortText = ""
  }
  else {
    console.log("no service number");
    //this.dontSelectServiceNumber = false
    this.selectedServiceNumberRecord = undefined;
  }
}
//In Update to handle shortTextChangeAlowlled Flag 
onServiceNumberUpdateChange(event: any) {
  const updateSelectedRecord = this.recordsServiceNumber.find(record => record.serviceNumberCode === event.value);
  if (updateSelectedRecord) {
    this.updateSelectedServiceNumberRecord = updateSelectedRecord
    this.updateShortTextChangeAllowed = this.updateSelectedServiceNumberRecord?.shortTextChangeAllowed || false;
    this.updateShortText = ""
  }
  else {
    this.updateSelectedServiceNumberRecord = undefined;
  }
}

//In Creation SubItem to handle shortTextChangeAlowlled Flag 
onServiceNumberChangeSubItem(event: any) {
  const selectedRecord = this.recordsServiceNumber.find(record => record.serviceNumberCode === this.selectedServiceNumberSubItem);
  if (selectedRecord) {
    this.selectedServiceNumberRecordSubItem = selectedRecord
    this.shortTextChangeAllowedSubItem = this.selectedServiceNumberRecordSubItem?.shortTextChangeAllowed || false;
    this.shortTextSubItem = ""
  }
  else {
    console.log("no service number");
    //this.dontSelectServiceNumber = false
    this.selectedServiceNumberRecordSubItem = undefined;
  }
}
//In Update SubItem to handle shortTextChangeAlowlled Flag 
onServiceNumberUpdateChangeSubItem(event: any) {
  const updateSelectedRecord = this.recordsServiceNumber.find(record => record.serviceNumberCode === event.value);
  if (updateSelectedRecord) {
    this.updateSelectedServiceNumberRecordSubItem = updateSelectedRecord
    this.updateShortTextChangeAllowedSubItem = this.updateSelectedServiceNumberRecordSubItem?.shortTextChangeAllowed || false;
    this.updateShortTextSubItem = ""
  }
  else {
    this.updateSelectedServiceNumberRecordSubItem = undefined;
  }
}

onFormulaSelect(event: any) {
  const selectedRecord = this.recordsFormula.find(record => record.formula === this.selectedFormula);
  if (selectedRecord) {
    this.selectedFormulaRecord = selectedRecord
    console.log(this.selectedFormulaRecord);

  }
  else {
    console.log("no Formula");
    this.selectedFormulaRecord = undefined;
  }
}
onFormulaUpdateSelect(event: any) {
  const selectedRecord = this.recordsFormula.find(record => record.formula === event.value);
  if (selectedRecord) {
    this.updatedFormulaRecord = selectedRecord
    console.log(this.updatedFormulaRecord);

  }
  else {
    this.updatedFormulaRecord = undefined;
    console.log(this.updatedFormulaRecord);
  }
}

onFormulaSelectSubItem(event: any) {
  const selectedRecord = this.recordsFormula.find(record => record.formula === this.selectedFormulaSubItem);
  if (selectedRecord) {
    this.selectedFormulaRecordSubItem = selectedRecord
    console.log(this.selectedFormulaRecordSubItem);

  }
  else {
    console.log("no Formula");
    this.selectedFormulaRecordSubItem = undefined;
  }
}
onFormulaUpdateSelectSubItem(event: any) {
  const selectedRecord = this.recordsFormula.find(record => record.formula === event.value);
  if (selectedRecord) {
    this.updatedFormulaRecordSubItem = selectedRecord
    console.log(this.updatedFormulaRecordSubItem);

  }
  else {
    this.updatedFormulaRecordSubItem = undefined;
    console.log(this.updatedFormulaRecordSubItem);
  }
}
expandAll() {
  this.mainItemsRecords.forEach(item => this.expandedRows[item.invoiceMainItemCode] = true);
}
collapseAll() {
  this.expandedRows = {};
}

// For Edit  MainItem
clonedMainItem: { [s: number]: MainItem } = {};
onMainItemEditInit(record: MainItem) {
  this.clonedMainItem[record.invoiceMainItemCode] = { ...record };
}
onMainItemEditSave(index: number, record: MainItem) {
  console.log(record);

  const { invoiceMainItemCode, total, totalWithProfit, ...mainItemWithoutMainItemCode } = record;
  const updatedMainItem = this.removePropertiesFrom(mainItemWithoutMainItemCode, ['invoiceMainItemCode', 'invoiceSubItemCode']);
  console.log(updatedMainItem);

  console.log(this.updateSelectedServiceNumber);
  if (this.updateSelectedServiceNumberRecord) {
    const newRecord: MainItem = {
      ...record, // Copy all properties from the original record
      subItems: (record?.subItems ?? []).map(subItem =>
        this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
      ),
      // Modify specific attributes
      unitOfMeasurementCode: this.updateSelectedServiceNumberRecord.baseUnitOfMeasurement,
      description: this.updateSelectedServiceNumberRecord.description,
    };
    console.log(newRecord);
    this.Apiservice.patchMainItem<MainItem>(record.invoiceMainItemCode, newRecord).subscribe({
      next: (res) => {
        console.log('mainitem  updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
  }
  if (this.updateSelectedServiceNumberRecord && this.updatedFormulaRecord && this.resultAfterTestUpdate) {
    console.log(record);
    console.log(this.updateSelectedServiceNumberRecord);
    const newRecord: MainItem = {
      ...record,
      subItems: (record?.subItems ?? []).map(subItem =>
        this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
      ),
      unitOfMeasurementCode: this.updateSelectedServiceNumberRecord.baseUnitOfMeasurement,
      description: this.updateSelectedServiceNumberRecord.description,
      quantity: this.resultAfterTestUpdate,
    };
    console.log(newRecord);
    this.Apiservice.patchMainItem<MainItem>( record.invoiceMainItemCode, newRecord).subscribe({
      next: (res) => {
        console.log('mainitem  updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {
        this.updatedFormulaRecord=undefined;
        this.resultAfterTestUpdate=undefined

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
  }
  if (this.updatedFormulaRecord && this.resultAfterTestUpdate) {
    const newRecord: MainItem = {
      ...record,
      subItems: (record?.subItems ?? []).map(subItem =>
        this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
      ),
      quantity: this.resultAfterTestUpdate,
    };
    console.log(newRecord);
    this.Apiservice.patchMainItem<MainItem>( record.invoiceMainItemCode, newRecord).subscribe({
      next: (res) => {
        console.log('mainitem  updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {
        this.updatedFormulaRecord=undefined;
        this.resultAfterTestUpdate=undefined
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
  }
  if (!this.updateSelectedServiceNumberRecord && !this.updatedFormulaRecord && !this.resultAfterTestUpdate) {
    console.log({ ...mainItemWithoutMainItemCode });
    this.Apiservice.patchMainItem<MainItem>( record.invoiceMainItemCode, { ...updatedMainItem }).subscribe({
      next: (res) => {
        console.log('mainitem  updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
  }
}
onMainItemEditCancel(row: MainItem, index: number) {
  this.mainItemsRecords[index] = this.clonedMainItem[row.invoiceMainItemCode]
  delete this.clonedMainItem[row.invoiceMainItemCode]
}

// For Edit  SubItem
clonedSubItem: { [s: number]: SubItem } = {};
onSubItemEditInit(record: SubItem) {
  if (record.invoiceSubItemCode) {
    this.clonedSubItem[record.invoiceSubItemCode] = { ...record };
  }
}
onSubItemEditSave(index: number, record: SubItem, mainItem: MainItem) {
  console.log(mainItem);
  console.log(record);
  console.log(index);

  const { invoiceSubItemCode, ...subItemWithoutSubItemCode } = record;
  console.log(this.updateSelectedServiceNumberSubItem);

  if (this.updateSelectedServiceNumberRecordSubItem) {

    const newRecord: SubItem = {
      ...record, // Copy all properties from the original record
      // Modify specific attributes
      unitOfMeasurementCode: this.updateSelectedServiceNumberRecordSubItem.baseUnitOfMeasurement,
      description: this.updateSelectedServiceNumberRecordSubItem.description,
    };
    console.log(newRecord);

    const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;

    const updatedSubItems = (mainItem?.subItems ?? []).map(subItem =>
      // Modify only the specific sub-item that needs to be updated
      subItem.invoiceSubItemCode === newRecord.invoiceSubItemCode
        ? this.removeProperties({ ...subItem, ...newRecord }, ['invoiceMainItemCode', 'invoiceSubItemCode'])
        : this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
    );

    const updatedRecord: MainItem = {
      ...mainItemWithoutMainItemCode, // Copy all properties from the original record
      subItems: updatedSubItems,
      invoiceMainItemCode: 0,
      totalWithProfit: 0,
      total: 0,
      amountPerUnitWithProfit: 0,
    }
    console.log(updatedRecord);
    // Remove properties with empty or default values
    const filteredRecord = Object.fromEntries(
      Object.entries(updatedRecord).filter(([_, value]) => {
        return value !== '' && value !== 0 && value !== undefined && value !== null;
      })
    );
    console.log(filteredRecord);

    this.Apiservice.patchMainItem<MainItem>( mainItem.invoiceMainItemCode, filteredRecord).subscribe({
      next: (res) => {
        console.log('mainitem with && subItem updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });

  }
  if (this.updateSelectedServiceNumberRecordSubItem && this.updatedFormulaRecordSubItem && this.resultAfterTestUpdate) {
    console.log(record);
    console.log(this.updateSelectedServiceNumberRecordSubItem);
    const newRecord: SubItem = {
      ...record,
      unitOfMeasurementCode: this.updateSelectedServiceNumberRecordSubItem.baseUnitOfMeasurement,
      description: this.updateSelectedServiceNumberRecordSubItem.description,
      quantity: this.resultAfterTestUpdate,
    };
    console.log(newRecord);

    const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;

    const updatedSubItems = (mainItem?.subItems ?? []).map(subItem =>
      // Modify only the specific sub-item that needs to be updated
      subItem.invoiceSubItemCode === newRecord.invoiceSubItemCode
        ? this.removeProperties({ ...subItem, ...newRecord }, ['invoiceMainItemCode', 'invoiceSubItemCode'])
        : this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
    );

    const updatedRecord: MainItem = {
      ...mainItemWithoutMainItemCode, // Copy all properties from the original record
      subItems: updatedSubItems,
      invoiceMainItemCode: 0,
      totalWithProfit: 0,
      total: 0,
      amountPerUnitWithProfit: 0,
    }
    console.log(updatedRecord);
    // Remove properties with empty or default values
    const filteredRecord = Object.fromEntries(
      Object.entries(updatedRecord).filter(([_, value]) => {
        return value !== '' && value !== 0 && value !== undefined && value !== null;
      })
    );
    console.log(filteredRecord);

    this.Apiservice.patchMainItem<MainItem>(mainItem.invoiceMainItemCode, filteredRecord).subscribe({
      next: (res) => {
        console.log('mainitem with && subItem updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {
        this.updatedFormulaRecordSubItem=undefined;
        this.resultAfterTestUpdate=undefined
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
  }
  if (this.updatedFormulaRecordSubItem && this.resultAfterTestUpdate) {
    const newRecord: SubItem = {
      ...record,
      quantity: this.resultAfterTestUpdate,
    };
    console.log(newRecord);

    const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;

    const updatedSubItems = (mainItem?.subItems ?? []).map(subItem =>
      // Modify only the specific sub-item that needs to be updated
      subItem.invoiceSubItemCode === newRecord.invoiceSubItemCode
        ? this.removeProperties({ ...subItem, ...newRecord }, ['invoiceMainItemCode', 'invoiceSubItemCode'])
        : this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
    );

    const updatedRecord: MainItem = {
      ...mainItemWithoutMainItemCode, // Copy all properties from the original record
      subItems: updatedSubItems,
      invoiceMainItemCode: 0,
      totalWithProfit: 0,
      total: 0,
      amountPerUnitWithProfit: 0,
    }
    console.log(updatedRecord);
    // Remove properties with empty or default values
    const filteredRecord = Object.fromEntries(
      Object.entries(updatedRecord).filter(([_, value]) => {
        return value !== '' && value !== 0 && value !== undefined && value !== null;
      })
    );
    console.log(filteredRecord);

    this.Apiservice.patchMainItem<MainItem>(mainItem.invoiceMainItemCode, filteredRecord).subscribe({
      next: (res) => {
        console.log('mainitem with && subItem updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {
        this.updatedFormulaRecordSubItem=undefined;
        this.resultAfterTestUpdate=undefined
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
  }
  if (!this.updateSelectedServiceNumberRecordSubItem && !this.updatedFormulaRecordSubItem && !this.resultAfterTestUpdate) {

    const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;

    const updatedSubItems = (mainItem?.subItems ?? []).map(subItem =>
      // Modify only the specific sub-item that needs to be updated
      subItem.invoiceSubItemCode === invoiceSubItemCode
        ? this.removeProperties({ ...subItem, ...subItemWithoutSubItemCode }, ['invoiceMainItemCode', 'invoiceSubItemCode'])
        : this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
    );

    const updatedRecord: MainItem = {
      ...mainItemWithoutMainItemCode, // Copy all properties from the original record
      subItems: updatedSubItems,
      invoiceMainItemCode: 0,
      totalWithProfit: 0,
      total: 0,
      amountPerUnitWithProfit: 0,
    }
    console.log(updatedRecord);
    // Remove properties with empty or default values
    const filteredRecord = Object.fromEntries(
      Object.entries(updatedRecord).filter(([_, value]) => {
        return value !== '' && value !== 0 && value !== undefined && value !== null;
      })
    );
    console.log(filteredRecord);

    this.Apiservice.patchMainItem<MainItem>( mainItem.invoiceMainItemCode, filteredRecord).subscribe({
      next: (res) => {
        console.log('mainitem with && subItem updated:', res);
        this.totalValue = 0;
        this.ngOnInit()
      }, error: (err) => {
        console.log(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
      },
      complete: () => {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record updated successfully ' });
        // this.ngOnInit()
      }
    });
    // this._ApiService.patch<SubItem>('subitems', index, { ...subItemWithoutSubItemCode }).subscribe(response => {
    //   console.log('subitem updated:', response);
    //   if (response) {
    //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record is updated' });
    //   }
    //   else {
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
    //   }
    //   //this.totalValue = 0;
    //   //this.modelSpecDetailsService.getRecords();
    //   this.ngOnInit()
    // });
  }
}
onSubItemEditCancel(subItem: any, index: number) {
  // Check if subItem exists in clonedSubItems
  const originalItem = this.clonedSubItem[subItem.invoiceSubItemCode];

  if (originalItem) {
    // Revert the item in the table to its original state
    this.mainItemsRecords.forEach(mainItem => {
      if (mainItem.subItems && mainItem.subItems[index] === subItem) {
        mainItem.subItems[index] = { ...originalItem }; // Restore original item
      }
    });
    // Remove the item from clonedSubItems
    delete this.clonedSubItem[subItem.invoiceSubItemCode];
  }

}

// Delete MainItem || SubItem
deleteRecord() {
  console.log("delete");
  if (this.selectedMainItems.length) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        for (const record of this.selectedMainItems) {
          console.log(record);
          this.Apiservice.deleteMainItem<MainItem>( record.invoiceMainItemCode).subscribe(response => {
            console.log('mainitem deleted :', response);
            this.totalValue = 0;
            this.ngOnInit();
          });
        }
        this.messageService.add({ severity: 'success', summary: 'Successfully', detail: 'Deleted', life: 3000 });
        this.selectedMainItems = []; // Clear the selectedRecords array after deleting all records
      }
    });
  }
  if (this.selectedSubItems.length) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        for (const record of this.selectedSubItems) {
          console.log(record);
          if (record.invoiceSubItemCode) {
            this.Apiservice.deleteSubItems<SubItem>( record.invoiceSubItemCode).subscribe(response => {
              console.log('subitem deleted :', response);
              //this.totalValue = 0;
              this.ngOnInit();
            });
          }

        }
        this.messageService.add({ severity: 'success', summary: 'Successfully', detail: 'Deleted', life: 3000 });
        this.selectedSubItems = []; // Clear the selectedRecords array after deleting all records
      }
    });
  }
}

// For Add new  Main Item
newMainItem: MainItem = {
  Type: '',
  invoiceMainItemCode: 0,
  serviceNumberCode: 0,
  description: "",
  quantity: 0,
  unitOfMeasurementCode: "",
  formulaCode: "",
  amountPerUnit: 0,
  currencyCode: "",
  total: 0,
  profitMargin: 0,
  totalWithProfit: 0
};

addMainItem() {

  if (!this.selectedServiceNumberRecord && !this.selectedFormulaRecord) { // if user didn't select serviceNumber && didn't select formula

    const newRecord = {
      unitOfMeasurementCode: this.selectedUnitOfMeasure,
      currencyCode: this.selectedCurrency,
      description: this.newMainItem.description,
      quantity: this.newMainItem.quantity,
      amountPerUnit: this.newMainItem.amountPerUnit,
      total: this.newMainItem.total,
      profitMargin: this.newMainItem.profitMargin,
      totalWithProfit: this.newMainItem.totalWithProfit
    }
    if (this.newMainItem.quantity === 0 || this.newMainItem.description === "" || this.selectedCurrency === "") {
      // || this.newMainItem.unitOfMeasurementCode === ""  // till retrieved from cloud correctly
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Description & Quantity & Currency and UnitOfMeasurement are required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);

      this.Apiservice.postMaintItem<MainItem>( filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewMainItem();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }

      });
    }
  }
  else if (!this.selectedServiceNumberRecord && this.selectedFormulaRecord && this.resultAfterTest) { // if user didn't select serviceNumber && select formula
    const newRecord = {
      unitOfMeasurementCode: this.selectedUnitOfMeasure,
      currencyCode: this.selectedCurrency,
      formulaCode: this.selectedFormula,
      description: this.newMainItem.description,
      quantity: this.resultAfterTest,
      amountPerUnit: this.newMainItem.amountPerUnit,
      total: this.newMainItem.total,
      profitMargin: this.newMainItem.profitMargin,
      totalWithProfit: this.newMainItem.totalWithProfit
    }
    if (this.resultAfterTest === 0 || this.newMainItem.description === "" || this.selectedCurrency === "") {
      // || this.newMainItem.unitOfMeasurementCode === ""  // till retrieved from cloud correctly
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Description & Quantity & Currency and UnitOfMeasurement are required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);
      this.Apiservice.postMaintItem<MainItem>( filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewMainItem();
          this.selectedFormulaRecord = undefined
          this.resultAfterTest=undefined;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }

      });
    }
  }
  else if (this.selectedServiceNumberRecord && !this.selectedFormulaRecord && !this.resultAfterTest) { // if user select serviceNumber && didn't select formula
    const newRecord = {
      serviceNumberCode: this.selectedServiceNumber,
      unitOfMeasurementCode: this.selectedServiceNumberRecord.baseUnitOfMeasurement,
      currencyCode: this.selectedCurrency,
      description: this.selectedServiceNumberRecord.description,
      quantity: this.newMainItem.quantity,
      amountPerUnit: this.newMainItem.amountPerUnit,
      total: this.newMainItem.total,
      profitMargin: this.newMainItem.profitMargin,
      totalWithProfit: this.newMainItem.totalWithProfit
    }
    if (this.newMainItem.quantity === 0 || this.selectedServiceNumberRecord.description === "" || this.selectedCurrency === "") {
      // || this.newMainItem.unitOfMeasurementCode === ""  // till retrieved from cloud correctly
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Description & Quantity & Currency and UnitOfMeasurement are required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);
      this.Apiservice.postMaintItem<MainItem>(filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewMainItem();
          this.selectedFormulaRecord = undefined;
          this.selectedServiceNumberRecord = undefined;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }

      });
    }
  }
  else if (this.selectedServiceNumberRecord && this.selectedFormulaRecord && this.resultAfterTest) { // if user select serviceNumber && select formula
    const newRecord = {
      serviceNumberCode: this.selectedServiceNumber,
      unitOfMeasurementCode: this.selectedServiceNumberRecord.baseUnitOfMeasurement,
      currencyCode: this.selectedCurrency,
      formulaCode: this.selectedFormula,
      description: this.selectedServiceNumberRecord.description,
      quantity: this.resultAfterTest,
      amountPerUnit: this.newMainItem.amountPerUnit,
      total: this.newMainItem.total,
      profitMargin: this.newMainItem.profitMargin,
      totalWithProfit: this.newMainItem.totalWithProfit
    }
    if (this.resultAfterTest === 0 || this.selectedServiceNumberRecord.description === "" || this.selectedCurrency === "") {
      // || this.newMainItem.unitOfMeasurementCode === ""  // till retrieved from cloud correctly
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Description & Quantity & Currency and UnitOfMeasurement are required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);
      this.Apiservice.postMaintItem<MainItem>( filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewMainItem();
          this.selectedFormulaRecord = undefined
          this.resultAfterTest=undefined;
          this.selectedServiceNumberRecord = undefined;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }
      });
    }
  }

}

resetNewMainItem() {
  this.newMainItem = {
    Type: '',
    invoiceMainItemCode: 0,
    serviceNumberCode: 0,
    description: "",
    quantity: 0,
    unitOfMeasurementCode: "",
    formulaCode: "",
    amountPerUnit: 0,
    currencyCode: "",
    total: 0,
    profitMargin: 0,
    totalWithProfit: 0,
    // subItems?:SubItem[]
  },
    this.selectedUnitOfMeasure = "";
  this.selectedFormula = "";
  this.selectedCurrency = "";
}

// For Add new  Sub Item
newSubItem: SubItem = {
  Type: '',
  invoiceSubItemCode: 0,
  // invoiceMainItemCode: 0,
  serviceNumberCode: 0,
  description: "",
  quantity: 0,
  unitOfMeasurementCode: "",
  formulaCode: "",
  amountPerUnit: 0,
  currencyCode: "",
  total: 0
};

addSubItem(mainItem: MainItem) {
  console.log(mainItem);
  if (!this.selectedServiceNumberRecordSubItem && !this.selectedFormulaRecordSubItem) { // if user didn't select serviceNumber && didn't select formula

    const newRecord = {
      unitOfMeasurementCode: this.selectedUnitOfMeasureSubItem,
      currencyCode: this.selectedCurrencySubItem,
      description: this.newSubItem.description,
      quantity: this.newSubItem.quantity,
      amountPerUnit: this.newSubItem.amountPerUnit,
    }
    if (this.newSubItem.amountPerUnit === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'AmountPerUnit is required',
        life: 3000
      });
    }
    else {
      console.log(newRecord)
      const filteredSubItem = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredSubItem);
      const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;

      const updatedRecord: MainItem = {
        ...mainItemWithoutMainItemCode, // Copy all properties from the original record
        subItems: [
          ...(mainItem?.subItems ?? []).map(subItem =>
            this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
          ),
          filteredSubItem
        ],

        invoiceMainItemCode: 0,
        totalWithProfit: 0,
        amountPerUnitWithProfit: 0,
        total: 0,
      }
      console.log(updatedRecord.subItems);

      console.log(updatedRecord);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(updatedRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);

      this.Apiservice.patchMainItem<MainItem>( mainItem.invoiceMainItemCode, filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem updated && subItem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewSubItem();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }
      });

    }
  }
  else if (!this.selectedServiceNumberRecordSubItem && this.selectedFormulaRecordSubItem && this.resultAfterTest) { // if user didn't select serviceNumber && select formula
    const newRecord = {
      unitOfMeasurementCode: this.selectedUnitOfMeasureSubItem,
      currencyCode: this.selectedCurrencySubItem,
      formulaCode: this.selectedFormulaSubItem,
      description: this.newSubItem.description,
      quantity: this.resultAfterTest,
      amountPerUnit: this.newSubItem.amountPerUnit,
    }
    if (this.newSubItem.amountPerUnit === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'AmountPerUnit is required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);

      const filteredSubItem = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredSubItem);
      const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;
      const updatedRecord: MainItem = {
        ...mainItemWithoutMainItemCode, // Copy all properties from the original record
        subItems: [
          ...(mainItem?.subItems ?? []).map(subItem =>
            this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
          ),
          filteredSubItem
        ],

        invoiceMainItemCode: 0,
        totalWithProfit: 0,
        amountPerUnitWithProfit: 0,
        total: 0,
      }
      console.log(updatedRecord.subItems);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(updatedRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);
      this.Apiservice. patchMainItem<MainItem>(mainItem.invoiceMainItemCode, filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem updated && subItem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewSubItem();
          this.selectedFormulaRecordSubItem = undefined
          this.resultAfterTest=undefined;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }
      });
    }
  }
  else if (this.selectedServiceNumberRecordSubItem && !this.selectedFormulaRecordSubItem && !this.resultAfterTest) { // if user select serviceNumber && didn't select formula

    const newRecord = {
      serviceNumberCode: this.selectedServiceNumberSubItem,
      unitOfMeasurementCode: this.selectedServiceNumberRecordSubItem.baseUnitOfMeasurement,
      currencyCode: this.selectedCurrencySubItem,
      description: this.selectedServiceNumberRecordSubItem.description,
      quantity: this.newSubItem.quantity,
      amountPerUnit: this.newSubItem.amountPerUnit,
    }

    if (this.newSubItem.amountPerUnit === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'AmountPerUnit is required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);

      const filteredSubItem = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredSubItem);

      // const { mainItemCode, ...mainItemWithoutMainItemCode } = mainItem;
      const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;
      const updatedRecord: MainItem = {
        ...mainItemWithoutMainItemCode, // Copy all properties from the original record
        subItems: [
          ...(mainItem?.subItems ?? []).map(subItem =>
            this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
          ),
          filteredSubItem
        ],

        invoiceMainItemCode: 0,
        totalWithProfit: 0,
        amountPerUnitWithProfit: 0,
        total: 0,

      }

      console.log(updatedRecord);
      console.log(updatedRecord.subItems);

      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(updatedRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);

      this.Apiservice.patchMainItem<MainItem>( mainItem.invoiceMainItemCode, filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem updated && subItem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewSubItem();
          this.selectedFormulaRecordSubItem = undefined;
          this.selectedServiceNumberRecordSubItem = undefined
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }
      });

    }
  }
  else if (this.selectedServiceNumberRecordSubItem && this.selectedFormulaRecordSubItem && this.resultAfterTest) { // if user select serviceNumber && select formula
    const newRecord = {
      serviceNumberCode: this.selectedServiceNumberSubItem,
      unitOfMeasurementCode: this.selectedServiceNumberRecordSubItem.baseUnitOfMeasurement,
      currencyCode: this.selectedCurrencySubItem,
      formulaCode: this.selectedFormulaSubItem,
      description: this.selectedServiceNumberRecordSubItem.description,
      quantity: this.resultAfterTest,
      amountPerUnit: this.newSubItem.amountPerUnit,
    }
    if (this.newSubItem.amountPerUnit === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'AmountPerUnit is required',
        life: 3000
      });
    }
    else {
      console.log(newRecord);
      const filteredSubItem = Object.fromEntries(
        Object.entries(newRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredSubItem);

      //const { mainItemCode, ...mainItemWithoutMainItemCode } = mainItem;
      const { invoiceMainItemCode, total, totalWithProfit, amountPerUnitWithProfit, ...mainItemWithoutMainItemCode } = mainItem;
      const updatedRecord: MainItem = {
        ...mainItemWithoutMainItemCode, // Copy all properties from the original record
        subItems: [
          ...(mainItem?.subItems ?? []).map(subItem =>
            this.removeProperties(subItem, ['invoiceMainItemCode', 'invoiceSubItemCode'])
          ),
          filteredSubItem
        ],

        invoiceMainItemCode: 0,
        totalWithProfit: 0,
        amountPerUnitWithProfit: 0,
        total: 0,
      }
      console.log(updatedRecord.subItems);
      console.log(updatedRecord);
      // Remove properties with empty or default values
      const filteredRecord = Object.fromEntries(
        Object.entries(updatedRecord).filter(([_, value]) => {
          return value !== '' && value !== 0 && value !== undefined && value !== null;
        })
      );
      console.log(filteredRecord);
      this.Apiservice.patchMainItem<MainItem>( mainItem.invoiceMainItemCode, filteredRecord).subscribe({
        next: (res) => {
          console.log('mainitem updated && subItem created:', res);
          this.totalValue = 0;
          this.ngOnInit()
        }, error: (err) => {
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid Data' });
        },
        complete: () => {
          this.resetNewSubItem();
          this.selectedFormulaRecordSubItem = undefined
          this.resultAfterTest=undefined;
          this.selectedServiceNumberRecordSubItem = undefined
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record added successfully ' });
          // this.ngOnInit()
        }
      });
    }
  }
}

resetNewSubItem() {
  this.newSubItem = {
    Type: '',
    invoiceSubItemCode: 0,
    // invoiceMainItemCode: 0,
    serviceNumberCode: 0,
    description: "",
    quantity: 0,
    unitOfMeasurementCode: "",
    formulaCode: "",
    amountPerUnit: 0,
    currencyCode: "",
    total: 0
  },
    this.selectedUnitOfMeasureSubItem = "";
  this.selectedFormulaSubItem = "";
  this.selectedCurrencySubItem = "";
}

// Export to excel sheet:
transformData(data: MainItem[]) {
  const transformed: MainItem[] = []

  data.forEach((mainItem) => {
    transformed.push({
      Type: 'Main Item',
      serviceNumberCode: mainItem.serviceNumberCode,
      description: mainItem.description,
      quantity: mainItem.quantity,
      unitOfMeasurementCode: mainItem.unitOfMeasurementCode,
      formulaCode: mainItem.formulaCode,
      amountPerUnit: mainItem.amountPerUnit,
      currencyCode: mainItem.currencyCode,
      total: mainItem.total,
      profitMargin: mainItem.profitMargin,
      totalWithProfit: mainItem.totalWithProfit,
      doNotPrint: mainItem.doNotPrint,
      invoiceMainItemCode: mainItem.invoiceMainItemCode
    });

    // Add subitems
    mainItem.subItems?.forEach(subItem => {
      transformed.push({
        Type: 'Sub Item',
        serviceNumberCode: subItem.serviceNumberCode,
        description: subItem.description,
        quantity: subItem.quantity,
        unitOfMeasurementCode: subItem.unitOfMeasurementCode,
        amountPerUnit: subItem.amountPerUnit,
        formulaCode: subItem.formulaCode,
        currencyCode: subItem.currencyCode,
        total: subItem.total,

        //profitMargin: mainItem.profitMargin,
        totalWithProfit: 0,
        // doNotPrint: subItem.doNotPrint,

        invoiceMainItemCode: mainItem.invoiceMainItemCode,
      });
    });
  });

  return transformed;
}

exportExcel() {
  import('xlsx').then((xlsx) => {
    const transformedData = this.transformData(this.mainItemsRecords);
    const worksheet = xlsx.utils.json_to_sheet(transformedData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const ws = workbook.Sheets.data;
    if (!ws['!ref']) {
      ws['!ref'] = 'A1:Z1000';
    }
    const range = xlsx.utils.decode_range(ws['!ref']);
    let rowStart = 1;

    transformedData.forEach((row, index) => {
      if (row.Type === 'Main Item') {

        if (index + 1 < transformedData.length && transformedData[index + 1].Type === 'Sub Item') {
          ws['!rows'] = ws['!rows'] || [];
          ws['!rows'][index] = { hidden: false };
          ws['!rows'][index + 1] = { hidden: false };
        } else {
          ws['!rows'] = ws['!rows'] || [];
          ws['!rows'][index] = { hidden: false };
        }
      } else {
        ws['!rows'] = ws['!rows'] || [];
        ws['!rows'][index] = { hidden: false };
      }
    });

    const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Tendering BOQ');
  });
}

saveAsExcelFile(buffer: any, fileName: string): void {
  let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], {
    type: EXCEL_TYPE
  });
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}

// handle Formula Parameters 
showPopup: boolean = false;
parameterValues: { [key: string]: number } = {};
showPopupUpdate: boolean = false;
parameterValuesUpdate: { [key: string]: number } = {};
openPopup() {
  if (this.selectedFormulaRecord) {
    this.showPopup = true;
    for (const parameterId of this.selectedFormulaRecord.parameterIds) {
      this.parameterValues[parameterId] = 0;
      console.log(this.parameterValues);
    }
  }
  else if (this.selectedFormulaRecordSubItem) {
    this.showPopup = true;
    for (const parameterId of this.selectedFormulaRecordSubItem.parameterIds) {
      this.parameterValues[parameterId] = 0;
      console.log(this.parameterValues);
    }
  }
  else {
    this.showPopup = false;
  }
}
openPopupUpdate() {
  if (this.updatedFormulaRecord) {
    this.showPopupUpdate = true;
    console.log(this.showPopupUpdate);

    for (const parameterId of this.updatedFormulaRecord.parameterIds) {
      this.parameterValuesUpdate[parameterId] = 0;
      console.log(this.parameterValuesUpdate);
    }
  } else if (this.updatedFormulaRecordSubItem) {
    this.showPopupUpdate = true;
    console.log(this.showPopupUpdate);

    for (const parameterId of this.updatedFormulaRecordSubItem.parameterIds) {
      this.parameterValuesUpdate[parameterId] = 0;
      console.log(this.parameterValuesUpdate);
    }
  }
  else {
    this.showPopupUpdate = false;
  }
}
resultAfterTest?: number
resultAfterTestUpdate?: number
saveParameters() {
  if (this.selectedFormulaRecord) {
    console.log(this.parameterValues);
    const valuesOnly = Object.values(this.parameterValues)
      .filter(value => typeof value === 'number') as number[];
    console.log(valuesOnly);
    console.log(this.resultAfterTest);

    const formulaObject: any = {
      formula: this.selectedFormulaRecord.formula,
      description: this.selectedFormulaRecord.description,
      numberOfParameters: this.selectedFormulaRecord.numberOfParameters,
      parameterIds: this.selectedFormulaRecord.parameterIds,
      parameterDescriptions: this.selectedFormulaRecord.parameterDescriptions,
      formulaLogic: this.selectedFormulaRecord.formulaLogic,
      testParameters: valuesOnly
    };
    console.log(formulaObject);
    this.Apiservice.patchFormula<any>( this.selectedFormulaRecord.formulaCode, formulaObject).subscribe((response: Formula) => {
      console.log('formula updated:', response);
      this.resultAfterTest = response.result;
      console.log(this.resultAfterTest);
    });
    this.showPopup = false;
  }
  if (this.updatedFormulaRecord) {
    console.log(this.parameterValuesUpdate);
    const valuesOnly = Object.values(this.parameterValuesUpdate)
      .filter(value => typeof value === 'number') as number[];
    console.log(valuesOnly);
    console.log(this.resultAfterTestUpdate);
    const formulaObject: any = {
      formula: this.updatedFormulaRecord.formula,
      description: this.updatedFormulaRecord.description,
      numberOfParameters: this.updatedFormulaRecord.numberOfParameters,
      parameterIds: this.updatedFormulaRecord.parameterIds,
      parameterDescriptions: this.updatedFormulaRecord.parameterDescriptions,
      formulaLogic: this.updatedFormulaRecord.formulaLogic,
      testParameters: valuesOnly
    };
    console.log(formulaObject);
    this.Apiservice.putFormula<any>(this.updatedFormulaRecord.formulaCode, formulaObject).subscribe((response: Formula) => {
      console.log('formula updated:', response);
      this.resultAfterTestUpdate = response.result;
      console.log(this.resultAfterTestUpdate);

    });
    this.showPopupUpdate = false;
  }

  if (this.selectedFormulaRecordSubItem) {
    console.log(this.parameterValues);
    const valuesOnly = Object.values(this.parameterValues)
      .filter(value => typeof value === 'number') as number[];
    console.log(valuesOnly);
    console.log(this.resultAfterTest);

    const formulaObject: any = {
      formula: this.selectedFormulaRecordSubItem.formula,
      description: this.selectedFormulaRecordSubItem.description,
      numberOfParameters: this.selectedFormulaRecordSubItem.numberOfParameters,
      parameterIds: this.selectedFormulaRecordSubItem.parameterIds,
      parameterDescriptions: this.selectedFormulaRecordSubItem.parameterDescriptions,
      formulaLogic: this.selectedFormulaRecordSubItem.formulaLogic,
      testParameters: valuesOnly
    };
    console.log(formulaObject);
    this.Apiservice.patchFormula<any>( this.selectedFormulaRecordSubItem.formulaCode, formulaObject).subscribe((response: Formula) => {
      console.log('formula updated:', response);
      this.resultAfterTest = response.result;
      console.log(this.resultAfterTest);
    });
    this.showPopup = false;
  }

  if (this.updatedFormulaRecordSubItem) {
    console.log(this.parameterValuesUpdate);
    const valuesOnly = Object.values(this.parameterValuesUpdate)
      .filter(value => typeof value === 'number') as number[];
    console.log(valuesOnly);
    console.log(this.resultAfterTestUpdate);
    const formulaObject: any = {
      formula: this.updatedFormulaRecordSubItem.formula,
      description: this.updatedFormulaRecordSubItem.description,
      numberOfParameters: this.updatedFormulaRecordSubItem.numberOfParameters,
      parameterIds: this.updatedFormulaRecordSubItem.parameterIds,
      parameterDescriptions: this.updatedFormulaRecordSubItem.parameterDescriptions,
      formulaLogic: this.updatedFormulaRecordSubItem.formulaLogic,
      testParameters: valuesOnly
    };
    console.log(formulaObject);
    this.Apiservice.putFormula<any>( this.updatedFormulaRecordSubItem.formulaCode, formulaObject).subscribe((response: Formula) => {
      console.log('formula updated:', response);
      this.resultAfterTestUpdate = response.result;
      console.log(this.resultAfterTestUpdate);

    });
    this.showPopupUpdate = false;
  }

}

closePopup() {
  this.showPopupUpdate = false;
  this.showPopup = false;
}
}