# Informations about services

The most part of code is in these services.

## Dependency graph

Below chart shows all services' dependency relation. `A --> B` means that A is depend on B.

```
                Components
===================||=====================
                   vv   (DI)

                StatusService      WatchService     HotkeysService
                    |                     |
    +---------------+------------------+  |
    v                                  v  v
BuildService                       DebugService
    +---------------+                  |
    |               v                  |
    v            ProblemService        |
FileService <--------------------------+ (Set trace line)
    |                                  |
    +--------+                         |
    v        |                         |
TabsService  |                         | (Get breakpoint info)
    |        |                         |
    |   +----+                         |
    v   v                              |
EditorService <------------------------+

===================||=====================
                   vv
            core/ElectronService (if needed)
```