v3.0.2
==================
* update ghp.sh to fix travis build

v3.0.1
==================
* Mitigate #10

v3.0.0
==================
* Fix px-table-row demo
* Update colors and icons
* Update dependencies for refresh

v2.0.7
==================
* Solves issue that prevents sorting in non-shadow DOM. Locks this component in to the Sortable library at the 1.4.X release track, as a regression in 1.5.X causes the sort to fail. Waiting on a patch submitted to Sortable that should fix the issue.
* Manually handles moving elements between sortable lists in shady DOM
* Removes some sort configuration properties that do not work because they can't be dynamic (`sort`, `disabled`, `store`) or can't notify

v2.0.6
==================
* updated to px-demo

v2.0.5
==================
* added OSS_Notice.pdf and .bowerrc

v2.0.4
==================
* Updating so px-demo-snippet and px-api-viewer get new grays

v2.0.3
==================
* Update colors design to pick up new colors

v2.0.2
==================
* changing ghp.sh to account for Alpha releases

v2.0.1
==================
* Fix travis configuration

v2.0.0
==================
* Standardize component API
* Remove un-supported features
* Remove unused dependencies

v1.1.0
==================
* Updated dependencies

v1.0.3
==================
* changing browser in wct testing from safari 8 to safari 10 on elcapitan

v1.0.2
==================
* changing all devDeps to ^

v1.0.1
==================
* Update px-theme to 2.0.1 and update test fixtures

v0.0.1
==================
* Initial release
