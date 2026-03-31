from pydantic import BaseModel, Field, ConfigDict
from pydantic.functional_validators import BeforeValidator
from typing import Optional, List
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class LabReportBase(BaseModel):
    hemoglobin: Optional[float] = None
    rbc_count: Optional[float] = None
    wbc_count: Optional[float] = None
    platelets: Optional[float] = None
    hematocrit: Optional[float] = None
    mcv: Optional[float] = None
    mch: Optional[float] = None
    mchc: Optional[float] = None
    rdw: Optional[float] = None
    neutrophils: Optional[float] = None
    lymphocytes: Optional[float] = None
    monocytes: Optional[float] = None
    eosinophils: Optional[float] = None
    basophils: Optional[float] = None
    alt: Optional[float] = None
    ast: Optional[float] = None
    alp: Optional[float] = None
    bilirubin: Optional[float] = None
    direct_bilirubin: Optional[float] = None
    total_protein: Optional[float] = None
    albumin: Optional[float] = None
    globulin: Optional[float] = None
    ag_ratio: Optional[float] = None
    creatinine: Optional[float] = None
    bun: Optional[float] = None
    bun_creatinine_ratio: Optional[float] = None
    uric_acid: Optional[float] = None
    egfr: Optional[float] = None
    fasting_sugar: Optional[float] = None
    post_prandial_sugar: Optional[float] = None
    hba1c: Optional[float] = None
    random_sugar: Optional[float] = None
    iron: Optional[float] = None
    tibc: Optional[float] = None
    ferritin: Optional[float] = None
    transferrin_sat: Optional[float] = None
    tsh: Optional[float] = None
    t3: Optional[float] = None
    t4: Optional[float] = None
    free_t3: Optional[float] = None
    free_t4: Optional[float] = None

class LabReportCreate(LabReportBase):
    pass

class LabReport(LabReportBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    patient_id: str
    
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

class PatientBase(BaseModel):
    name: str
    age: int = Field(le=100)
    gender: str
    blood_group: str

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
