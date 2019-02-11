import { Component, Inject, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Server } from '../../models/server';
import { ServerService } from '../../services/server.service';
import { ServerDatabase } from '../../services/server.database';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-server-list',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.css']
})
export class ServersComponent implements OnInit {
  dataSource: ServerDataSource;
  displayedColumns = ['id', 'name', 'location', 'ip', 'port', 'actions'];

  constructor(
    private dialog: MatDialog,
    private serverService: ServerService,
    private serverDatabase: ServerDatabase,
    private electronService: ElectronService,
  ) {}

  ngOnInit() {
    this.serverService.findAll().then((servers: Server[]) => {
      this.serverDatabase.addServers(servers);
    });

    this.dataSource = new ServerDataSource(this.serverDatabase);
  }

  createModal() {
    const dialogRef = this.dialog.open(AddServerDialogComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(server => {
      if (server) {
        this.serverService.create(server).then((created: Server) => {
          this.serverDatabase.addServer(created);
        });
      }
    });
  }

  getServerStatus(server: Server) {
    if(server.location === 'local') {
      if(server.status === undefined) {
        return 'stopped';
      }
      return server.status;
    }
  }

  deleteServer(server: Server) {
    this.serverService.delete(server).then(() => {
      this.serverDatabase.remove(server);
    });
  }

  async startServer(server: Server) {
    await this.electronService.remote.require('./local-server.js').startLocalServer(server);
    server.status = 'running';
    this.serverDatabase.update(server);
  }

  async stopServer(server: Server) {
    await this.electronService.remote.require('./local-server.js').stopLocalServer(server);
    server.status = 'stopped';
    this.serverDatabase.update(server);
  }
}

@Component({
  selector: 'app-add-server-dialog',
  templateUrl: 'add-server-dialog.html'
})
export class AddServerDialogComponent implements OnInit {
  server: Server = new Server();

  authorizations = [{ key: 'none', name: 'No authorization' }, { key: 'basic', name: 'Basic authorization' }];
  locations = [];

  constructor(
    public dialogRef: MatDialogRef<AddServerDialogComponent>,
    private electronService: ElectronService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  getLocations() {
    let locations = [];
    if(this.electronService.isElectronApp) {
      locations.push({ key: 'local', name: 'Local' });
    }
    locations.push({ key: 'remote', name: 'Remote' });
    return locations
  }

  getDefaultLocation() {
    if(this.electronService.isElectronApp) {
      return 'local';
    }
    return 'remote';
  }

  getDefaultLocalServerPath() {
    return this.electronService.remote.require('./local-server.js').getLocalServerPath();
  }

  ngOnInit() {
    this.locations = this.getLocations();
    this.server.authorization = 'none';
    this.server.location = this.getDefaultLocation();
    this.server.path = this.getDefaultLocalServerPath();
  }

  onAddClick(): void {
    // clear path if not local server
    if(this.server.location !== 'local') {
      this.server.path = null;
    }
    this.dialogRef.close(this.server);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

export class ServerDataSource extends DataSource<Server> {
  constructor(private serverDatabase: ServerDatabase) {
    super();
  }

  connect(): Observable<Server[]> {
    return merge(this.serverDatabase.dataChange).pipe(
      map(() => {
        return this.serverDatabase.data;
      })
    );
  }

  disconnect() {}
}
