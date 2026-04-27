# VecTraits Column Definitions

Reference for every field in the VecTraits database (VectorByte / VectorBiTE Data Platform).
Source: [VectorBite Data Platform docs](https://vectorbitedataplatform.readthedocs.io/en/latest/vectraits/) · [API intro](https://vectorbyteorg.github.io/vectorbyte-training4/Intro_to_API.html)

---

## Record Identity

| Column | Type | Description |
|--------|------|-------------|
| `Id` | Integer | Auto-generated unique record identifier within VecTraits. |
| `DatasetID` | Text | Identifier of the source dataset from which this record was digitised. |
| `IndividualID` | Text | Identifier for the individual organism within a dataset, where applicable. |
| `OriginalID` | Text | Identifier used for this record in the original published source. |

---

## Trait — Original

These fields capture the trait exactly as reported in the source publication.

| Column | Type | Description |
|--------|------|-------------|
| `OriginalTraitName` | Text | Name of the trait as given in the source (e.g. `fecundity rate`, `development time`, `survival`). |
| `OriginalTraitDef` | Text | Definition or description of the trait as stated in the source (e.g. `mean eggs individual⁻¹ day⁻¹`). |
| `OriginalTraitValue` | Float | Numerical value of the trait measurement as recorded in the source. |
| `OriginalTraitUnit` | Text | Units of the original trait value (e.g. `days`, `eggs individual⁻¹ day⁻¹`, `proportion`). |
| `OriginalErrorPos` | Float | Positive error margin as reported in the source (upper bound of uncertainty). |
| `OriginalErrorNeg` | Float | Negative error margin as reported in the source (lower bound of uncertainty). |
| `OriginalErrorUnit` | Text | Type or unit of the error values (e.g. `SE`, `SD`, `95% CI`, `coefficient of variance`). |

---

## Trait — Standardised

These fields hold values converted to a consistent unit and scale to allow cross-study comparison.

| Column | Type | Description |
|--------|------|-------------|
| `StandardisedTraitName` | Text | Controlled vocabulary name for the trait after standardisation. |
| `StandardisedTraitDef` | Text | Standard definition applied to this trait category. |
| `StandardisedTraitValue` | Float | Trait value converted to the standard unit. |
| `StandardisedTraitUnit` | Text | Unit of the standardised value. |
| `StandardisedErrorPos` | Float | Positive error after unit conversion / standardisation. |
| `StandardisedErrorNeg` | Float | Negative error after unit conversion / standardisation. |
| `StandardisedErrorUnit` | Text | Unit or type of the standardised error. |

---

## Replication

| Column | Type | Description |
|--------|------|-------------|
| `Replicates` | Integer | Number of replicate measurements or individuals on which the reported value is based. |

---

## Experimental Conditions

| Column | Type | Description |
|--------|------|-------------|
| `Habitat` | Text | Broad habitat type of the experiment or sampling site (e.g. `terrestrial`, `aquatic`). |
| `LabField` | Text | Setting in which the data were collected: `laboratory` or `field`. |
| `ArenaValue` | Float | Size of the experimental arena (container, cage, plot, etc.). |
| `ArenaUnit` | Text | Unit of arena size (e.g. `m²`, `L`, `cm³`). |
| `ArenaValueSI` | Float | Arena size converted to SI units. |
| `ArenaUnitSI` | Text | SI unit for the converted arena size. |
| `AmbientTemp` | Float | Ambient / rearing temperature at which the experiment was conducted. |
| `AmbientTempMethod` | Text | How ambient temperature was measured or controlled (e.g. `incubator`, `thermocouple`). |
| `AmbientTempUnit` | Text | Unit of ambient temperature (e.g. `Celsius`, `Kelvin`). |
| `AmbientLight` | Float | Ambient light level during the experiment. |
| `AmbientLightUnit` | Text | Unit of the ambient light measurement (e.g. `lux`, `μmol m⁻² s⁻¹`, `L:D hours`). |
| `SecondStressor` | Text | Name of any second experimental stressor applied alongside temperature (e.g. `salinity`, `humidity`). |
| `SecondStressorDef` | Text | Definition or description of the second stressor. |
| `SecondStressorValue` | Float | Value of the second stressor applied. |
| `SecondStressorUnit` | Text | Unit of the second stressor value. |
| `TimeStart` | Text | Date/time when data collection began (format: `DD/MM/YY HH:MM`). Max 255 chars. |
| `TimeEnd` | Text | Date/time when data collection ended. |
| `TotalObsTimeValue` | Float | Total duration of the observation period. |
| `TotalObsTimeUnit` | Text | Unit of total observation time (e.g. `hours`, `days`). |
| `TotalObsTimeValueSI` | Float | Total observation time converted to SI units (seconds). |
| `TotalObsTimeUnitSI` | Text | SI unit for observation time (`s`). |
| `TotalObsTimeNotes` | Text | Additional notes on observation duration. |
| `ResRepValue` | Float | Value describing the resolution or interval of repeated measurements. |
| `ResRepUnit` | Text | Unit of measurement resolution / repeat interval. |
| `ResRepValueSI` | Float | Resolution/repeat value in SI units. |
| `ResRepUnitSI` | Text | SI unit of the resolution/repeat value. |

---

## Location

| Column | Type | Description |
|--------|------|-------------|
| `LocationText` | Text | Free-text description of the sampling or experimental location (e.g. country, region, institution). |
| `LocationType` | Text | Classification of location context (e.g. `field site`, `laboratory`, `greenhouse`). |
| `OriginalLocationDate` | Text | Date of data collection as given in the original source. |
| `LocationDate` | Text | Standardised date of data collection. |
| `LocationDatePrecision` | Text | Precision level of the location date (e.g. `year`, `month`, `day`). |
| `CoordinateType` | Text | System used for geographic coordinates (e.g. `WGS84`, `decimal degrees`). |
| `Latitude` | Float | Decimal-degree latitude of the study site. Negative values = Southern Hemisphere. |
| `Longitude` | Float | Decimal-degree longitude of the study site. Negative values = Western Hemisphere. |

---

## Interactor 1 (Primary Organism — the Vector)

Interactor 1 is the focal organism whose trait is being measured, typically the disease vector.

### Identity & Taxonomy

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1` | Text | Full scientific binomial of the primary organism (e.g. `Aedes aegypti`). |
| `Interactor1Common` | Text | Common or vernacular name (e.g. `yellow fever mosquito`, `pea aphid`). |
| `Interactor1Kingdom` | Text | Taxonomic kingdom (e.g. `Animalia`). |
| `Interactor1Phylum` | Text | Taxonomic phylum (e.g. `Arthropoda`). |
| `Interactor1Class` | Text | Taxonomic class (e.g. `Insecta`). Max 50 chars. |
| `Interactor1Order` | Text | Taxonomic order (e.g. `Diptera`). |
| `Interactor1Family` | Text | Taxonomic family (e.g. `Culicidae`). |
| `Interactor1Genus` | Text | Genus name (e.g. `Aedes`). |
| `Interactor1Species` | Text | Species epithet (e.g. `aegypti`). |

### Biological State

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1Stage` | Text | Life stage at time of measurement (e.g. `adult`, `larva`, `pupa`, `egg`, `juvenile`). |
| `Interactor1Sex` | Text | Sex of the organism (e.g. `female`, `male`, `mixed`, `unknown`). |
| `Interactor1Number` | Integer | Number of individuals of Interactor 1 used in the measurement. |
| `Interactor1Wholepart` | Text | Whether the whole organism or a specific part was measured (e.g. `whole`, `wing`, `leg`). |
| `Interactor1WholePartType` | Text | Category of the body part measured (e.g. `organ`, `tissue`, `appendage`). |

### Temperature Treatment

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1Temp` | Float | Experimental temperature applied to Interactor 1 during the trial. |
| `Interactor1TempUnit` | Text | Unit of experimental temperature (e.g. `Celsius`). |
| `Interactor1TempMethod` | Text | Method used to set or measure the organism's temperature (e.g. `water bath`, `incubator`). |

### Growth / Rearing Conditions

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1GrowthTemp` | Float | Temperature at which Interactor 1 was reared prior to the experiment. |
| `Interactor1GrowthTempUnit` | Text | Unit of growth/rearing temperature. |
| `Interactor1GrowthDur` | Float | Duration of the growth/rearing period. |
| `Interactor1GrowthdDurUnit` | Text | Unit of growth duration (e.g. `days`, `weeks`). |
| `Interactor1GrowthType` | Text | Type of rearing regime (e.g. `constant`, `fluctuating`, `natural`). |

### Acclimation

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1Acc` | Text | Whether acclimation was performed (`yes` / `no`). |
| `Interactor1AccTemp` | Float | Temperature used during acclimation. |
| `Interactor1AccTempNotes` | Text | Additional notes on acclimation temperature. |
| `Interactor1AccTime` | Float | Duration of acclimation period. |
| `Interactor1AccTimeUnit` | Text | Unit of acclimation duration. |
| `Interactor1AccTimeNotes` | Text | Additional notes on acclimation duration. |

### Origin / Field Collection Conditions

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1OrigTemp` | Float | Temperature at the original collection site or source colony. |
| `Interactor1OrigTempNotes` | Text | Notes on the original collection temperature. |
| `Interactor1OrigTime` | Float | Duration at original conditions before experiment. |
| `Interactor1OrigTimeUnit` | Text | Unit of time at original conditions. |
| `Interactor1OrigTimeNotes` | Text | Notes on time at original conditions. |

### Equilibration

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1EquilibTimeValue` | Float | Time allowed for the organism to equilibrate to experimental conditions. |
| `Interactor1EquilibTimeUnit` | Text | Unit of equilibration time. |

### Size

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1Size` | Float | Body size measurement of Interactor 1. |
| `Interactor1SizeUnit` | Text | Unit of body size (e.g. `mm`, `mg`). |
| `Interactor1SizeType` | Text | Type of size metric (e.g. `body length`, `wing length`, `mass`). |
| `Interactor1SizeSI` | Float | Body size converted to SI units. |
| `Interactor1SizeUnitSI` | Text | SI unit for body size. |

### Density

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1DenValue` | Float | Density of Interactor 1 individuals in the experimental arena. |
| `Interactor1DenUnit` | Text | Unit of density (e.g. `individuals m⁻²`, `individuals L⁻¹`). |
| `Interactor1DenTypeSI` | Text | SI density type. |
| `Interactor1DenValueSI` | Float | Density in SI units. |
| `Interactor1DenUnitSI` | Text | SI unit for density. |

### Mass (SI)

| Column | Type | Description |
|--------|------|-------------|
| `Interactor1MassValueSI` | Float | Body mass of Interactor 1 in SI units (kg). |
| `Interactor1MassUnitSI` | Text | SI unit for body mass (typically `kg`). |

---

## Interactor 2 (Secondary Organism — Host, Prey, Pathogen, etc.)

Interactor 2 is any second organism involved in the measurement (e.g. host, blood-meal source, prey, parasite). Field names mirror those of Interactor 1. Leave empty if not applicable.

| Column | Description |
|--------|-------------|
| `Interactor2` | Full scientific binomial of the secondary organism. |
| `Interactor2Common` | Common name of the secondary organism. |
| `Interactor2Kingdom` | Taxonomic kingdom of Interactor 2. |
| `Interactor2Phylum` | Taxonomic phylum. |
| `Interactor2Class` | Taxonomic class. |
| `Interactor2Order` | Taxonomic order. |
| `Interactor2Family` | Taxonomic family. |
| `Interactor2Genus` | Genus name. |
| `Interactor2Species` | Species epithet. |
| `Interactor2Stage` | Life stage at measurement. |
| `Interactor2Sex` | Sex of the secondary organism. |
| `Interactor2Temp` | Experimental temperature applied to Interactor 2. |
| `Interactor2TempUnit` | Unit of Interactor 2 temperature. |
| `Interactor2TempMethod` | Method for measuring/setting Interactor 2 temperature. |
| `Interactor2GrowthTemp` | Rearing temperature for Interactor 2. |
| `Interactor2GrowthTempUnit` | Unit of rearing temperature. |
| `Interactor2GrowthDur` | Duration of rearing period. |
| `Interactor2GrowthDurUnit` | Unit of rearing duration. |
| `Interactor2GrowthType` | Type of rearing regime. |
| `Interactor2Acc` | Whether acclimation was performed. |
| `Interactor2AccTemp` | Acclimation temperature. |
| `Interactor2AccTempNotes` | Notes on acclimation temperature. |
| `Interactor2AccTime` | Acclimation duration. |
| `Interactor2AccTimeUnit` | Unit of acclimation duration. |
| `Interactor2AccTimeNotes` | Notes on acclimation duration. |
| `Interactor2OrigTemp` | Temperature at original collection site. |
| `Interactor2OrigTempNotes` | Notes on original temperature. |
| `Interactor2OrigTime` | Duration at original conditions. |
| `Interactor2OrigTimeUnit` | Unit of time at original conditions. |
| `Interactor2OrigTimeNotes` | Notes on time at original conditions. |
| `Interactor2EquilibTimeValue` | Equilibration time value. |
| `Interactor2EquilibTimeUnit` | Unit of equilibration time. |
| `Interactor2Size` | Body size of Interactor 2. |
| `Interactor2SizeUnit` | Unit of body size. |
| `Interactor2SizeType` | Type of size metric. |
| `Interactor2SizeSI` | Body size in SI units. |
| `Interactor2SizeUnitSI` | SI unit for body size. |
| `Interactor2DenValue` | Density of Interactor 2 in the arena. |
| `Interactor2DenUnit` | Unit of density. |
| `Interactor2DenTypeSI` | SI density type. |
| `Interactor2DenValueSI` | Density in SI units. |
| `Interactor2DenUnitSI` | SI unit for density. |
| `Interactor2MassValueSI` | Body mass in SI units. |
| `Interactor2MassUnitSI` | SI unit for body mass. |

---

## Physical Processes

| Column | Type | Description |
|--------|------|-------------|
| `PhysicalProcess` | Text | Primary physical or environmental process relevant to the trait measurement (e.g. `thermal performance`, `desiccation`). |
| `PhysicalProcess_1` | Text | Additional physical process (secondary). |
| `PhysicalProcess_2` | Text | Additional physical process (tertiary). |

---

## Citation & Data Source

| Column | Type | Description |
|--------|------|-------------|
| `Citation` | Text | Full bibliographic citation for the source publication. |
| `DOI` | Text | Digital Object Identifier of the source publication. |
| `FigureTable` | Text | Figure or table number in the source from which the data were extracted (e.g. `Fig. 2A`, `Table 3`). |
| `CuratedByCitation` | Text | Citation for a secondary source that curated or re-published this data point. |
| `CuratedByDOI` | Text | DOI of the secondary curating source. |

---

## Submission & Administration

| Column | Type | Description |
|--------|------|-------------|
| `SubmittedBy` | Text | Name of the person who digitised and submitted this record. |
| `ContributorEmail` | Text | Email address of the data contributor. |
| `Notes` | Text | Free-text notes about the record, unusual circumstances, or caveats. |

---

## Display Defaults

| Column | Type | Description |
|--------|------|-------------|
| `DefaultChartXaxis` | Text | Suggested field to display on the x-axis when visualising this dataset (used by the VecTraits Explorer). |
| `DefaultChartCategory` | Text | Suggested field to use as the grouping/category variable in charts (used by the VecTraits Explorer). |

---

## Submission Rules (Quick Reference)

- Leave unknown/inapplicable fields **empty** — do not use `NA`, `NULL`, `n/a`, or `0` as placeholders.
- Submit data as **CSV only** (not `.xlsx`).
- `OriginalTraitValue` must be a number; summary statistics (mean, median) are acceptable but flag with `Replicates`.
- Coordinates in **decimal degrees** (WGS84); omit for purely laboratory studies.
- Error values (`OriginalErrorPos` / `OriginalErrorNeg`) should always be accompanied by `OriginalErrorUnit` specifying the error type (SE, SD, 95% CI, etc.).
