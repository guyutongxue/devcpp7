# Informations about services

The most part of code is in these services.

## Dependency graph

Below chart shows all services' dependency relation. `A --> B` means that A is depend on B.

```
      Components        StatusService
===================||=====================
                   vv

               HotkeysService      WatchService     
                                          |
                                          |
                                          v
BuildService                       DebugService     SettingsService
    +---------------+                  |                    |
    |               v             +----|--------------------+
    v            ProblemService   |    |                    |
FileService <---------------------+----+ (Set trace line)   |
    |                                  |                    |
    +--------+                         |               ThemeService
    v        |                         |                    |
TabsService  |                         | (Get breakpoint)   |
    |        |                         |                    |
    |   +----+                         |                    |
    v   v                              |                    |
EditorService <------------------------+--------------------+

===================||=====================
                   vv
            core/ElectronService (if needed)
```
