# Source data attribution

This derived database is available under the Open Database License (ODbL) 1.0:
https://opendatacommons.org/licenses/odbl/1-0/

© OpenStreetMap contributors, Overture Maps Foundation.

Overture release: **2026-08-19.0**. Public STAC latest release checked on 2026-09-07.

- Official source and license summary: https://docs.overturemaps.org/attribution/
- Building geometry/parts: https://docs.overturemaps.org/guides/buildings/
- Administrative boundaries: https://docs.overturemaps.org/guides/divisions/
- OpenStreetMap: https://www.openstreetmap.org/copyright
- Qian Shi, et al. *A First High-quality Vector Data of Buildings in East Asian Countries Based on a Comprehensive Large-scale Mapping Framework.* Zenodo, 22 July 2023. https://doi.org/10.5281/zenodo.8174931 — CC BY 4.0. Overture uses this source to supplement OSM footprint/roofprint coverage. Its source record fields remain present in each feature.
- Esri Community Maps contributions to boundary names remain identified in boundary `sources` metadata, with their source-specific license values preserved. https://communitymaps.arcgis.com/

Changes made here: selection by Seoul region intersection, assignment to one of the 25 district polygons, compact NDJSON serialization/gzip compression, explicit quality flags and aggregate statistics. **No source geometry coordinate or existing height was changed.** Missing heights were not fabricated. No photographic textures were copied.

Open map geometry is not a surveyed/cadastral certification, a completeness guarantee, or a photorealistic city model. Source-reported heights can include contributor estimates; the height field does not establish measurement method. The source update timestamp is not necessarily the date the building was surveyed or imaged.

Retain this notice, public source URLs, source metadata, and access to the derived source database when publishing renderer assets generated from this dataset. Repository code licenses do not override the data licenses.
