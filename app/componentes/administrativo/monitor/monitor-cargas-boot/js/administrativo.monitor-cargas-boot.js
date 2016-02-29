/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.4 - 29/02/2016
 *  - AJUSTES E TARIFAS
 *
 *  Versão 1.0.3 - 02/02/2016
 *  - Não inicia automaticamente a conexão
 *
 *  Versão 1.0.2 - 26/01/2016
 *  - Auditoria
 *
 *  Versão 1.0.1 - 13/01/2016
 *  - Modalidade "ARQUIVOS"
 *
 *  Versão 1.0 - 26/10/2015
 *
 */

// App
angular.module("administrativo-monitor-cargas-boot", ['SignalR','ngLocale']) 

.factory('monitorBootService',
    ["$http", "$rootScope", "$location", "Hub", "$timeout",
    function ($http, $rootScope, $location, Hub, $timeout) {
        
        var monitor = this;
        
        var conectado = false;
		
		var forceClose = false;

        //jQuery.support.cors = true;
        
        var options = {
            
            rootPath : $rootScope.signalRRootPath,//'http://localhost:50780/signalr',
            
            listeners: {
                'enviaMudancas': function (mudancas) {
                    //console.log("NOTIFY MUDANÇAS");console.log(mudancas);
                    $rootScope.$broadcast("notifyMonitorMudancas", mudancas);
                },
                'enviaLista': function (lista) {
                    //console.log("NOTIFY LISTA");
                    $rootScope.$broadcast("notifyMonitorLista", lista);
                }
            },

            methods: ['obtemListaBoot'],
            
            queryParams:{
                'token': $rootScope.token
            },
            
            errorHandler: function (error) {
                console.log("ERRO");
                console.log(error);
                conectado = false;
            },
            hubDisconnected: function () {
                if (!forceClose && hub.connection.lastError) {
                    console.log("LAST ERROR: " + hub.connection.lastError.message);
                    // Reconecta
                    hub.connection.start();
                }
            },
            jsonp : true,
            //transport: 'webSockets', //'longPolling'
            logging: false, //true,
            
            stateChanged: function(state){
                switch (state.newState) {
                    case $.signalR.connectionState.connecting:
                        //console.log("CONECTANDO...");
                        conectado = false;
                        break;
                    case $.signalR.connectionState.connected:
                        //console.log("CONECTADO!");
                        conectado = true;
                        $rootScope.$broadcast("notifyMonitorConnectionStatus", true);
                        //monitor.conectado();
                        break;
                    case $.signalR.connectionState.reconnecting:
                        //console.log("RECONECTANDO...");
                        conectado = false;
                        break;
                    case $.signalR.connectionState.disconnected:
                        //console.log("DESCONECTADO!");
                        conectado = false;
                        $rootScope.$broadcast("notifyMonitorConnectionStatus", false);
                        break;
                }
            }
        };
        
        //Hub setup
        //var hub = new Hub("ServerAtosCapital", options);
        

        var getAnoMesCorrente = function(){
            var dt = new Date();
            var mes = dt.getMonth() + 1;
            var ano = dt.getFullYear();
            if(mes < 10) return ano + "0" + mes;
            return ano + "" + mes;    
        }

        monitor.isConnected = function(){
            return conectado;    
        }
        
        monitor.conectar = function(){
			forceClose = false;
            if(!conectado || !hub || hub === null) hub = new Hub("ServerAtosCapital", options); 
            else $rootScope.$broadcast("notifyMonitorConnectionStatus", true);
        }
        
        // Filtros
        var filtroMonitorCargas = {//token : $rootScope.token,
                                   data : getAnoMesCorrente(),
                                   status : 0,
                                   idGrupo : 0,
                                   nuCnpj: '',
                                   cdAdquirente : 0 };
        
        monitor.getTotalDiasMesFiltrado = function(){
            var mes = parseInt(filtroMonitorCargas.data.substr(4, 2));
            if(mes === 4 || mes === 6 || mes === 9 || mes === 11) return 30;
            if(mes === 1 || mes === 3 || mes === 5 || mes === 7 || mes === 8 || mes === 10 || mes === 12) return 31;
            var ano = parseInt(filtroMonitorCargas.data.substr(0, 4));
            if(ano % 4 === 0) return 29;
            return 28;
        }
        
        monitor.getMesAnoFiltrado = function(){
            return filtroMonitorCargas.data;    
        }
        
        /**
          * Função que notifica ao servidor que está monitorando
          */
        monitor.obtemLista = function (filtro) {
            if(filtro && filtro !== null){
                // Data
                if(filtro.data && filtro.data.length === 6) filtroMonitorCargas.data = filtro.data;
                else filtroMonitorCargas.data = getAnoMesCorrente();
                // Grupo
                if(typeof filtro.idGrupo === 'number') filtroMonitorCargas.idGrupo = filtro.idGrupo;
                else filtroMonitorCargas.idGrupo = 0;
                // Filial
                if(typeof filtro.nuCnpj === 'string') filtroMonitorCargas.nuCnpj = filtro.nuCnpj;
                else filtroMonitorCargas.nuCnpj = '';
                // Status
                if(typeof filtro.status === 'string') filtroMonitorCargas.status = filtro.status;
                else filtroMonitorCargas.status = '';
                // Adquirente
                if(typeof filtro.cdAdquirente === 'number') filtroMonitorCargas.cdAdquirente = filtro.cdAdquirente;
                else filtroMonitorCargas.cdAdquirente = 0;
            }
            //console.log(filtro);
            //console.log(filtroMonitorCargas);
            // Invoca o método do lado do servidor
            hub.obtemListaBoot(filtroMonitorCargas).fail(function(error) {
                $rootScope.$broadcast("notifyMonitorFalha", error); 
            });
        };
        /**
          *
          */
        monitor.desconectar = function(){
            if(typeof hub !== 'undefined' && hub !== null){
				forceClose = true;
                hub.connection.stop();    
			}
        };
        
        return monitor;
    }])

.controller("administrativo-monitor-cargas-bootCtrl", ['$scope',
                                            '$rootScope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            '$timeout', 
                                            '$locale',
                                            'monitorBootService',      
                                            function($scope,$rootScope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter,$timeout,$locale,monitorService){ 
   
    $scope.monitor = monitorService;                                         
    $scope.monitorCargas = [];   
    $scope.filiais = [];
    $scope.adquirentes = []; 
    $scope.diasMesFiltrado = [];                                            
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyMonitorPos = 1; // posição da div que vai receber o loading progress
    $scope.itens_pagina = [50, 100, 150, 200];
    /*$scope.statuscarga = [{id: '2', nome: 'CARREGADO COM ERRO'},
                          {id: '1', nome: 'CARREGADO COM SUCESSO'},
                          {id: '7', nome : 'ELEGÍVEL'},
                          {id: '0', nome: 'EM EXECUÇÃO'},
                          {id: '4', nome: 'ERRO DE SENHA'},
                          {id: '3', nome: 'RE-EXECUÇÃO'}];*/
    $scope.modalidades = ['PAGOS ANTECIPAÇÃO', 'PAGOS CRÉDITO', 'PAGOS DÉBITO', 'LANÇAMENTOS FUTUROS', 'VENDA CRÉDITO', 'VENDA DÉBITO']; 
    $scope.modalidadesAbrev = ['PA', 'PC', 'PD', 'LF', 'VC', 'VD']; 
    //$scope.modalidadesClasse = ['red', 'PC', 'PD', 'LF', 'VC', 'VD']; 
    $scope.filtro = { data : new Date(), status : null,
                      filial : null, adquirente : null,
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 103,//$campos.administracao.logacesso.dtAcesso, 
                                         order : 1}}; 
    $scope.modalAuditoria = { modalidade: '', 
                              empresa : '',
                              adquirente : '',
                              dtCompetencia : '',
                              detalhe : null}                                            
    // flags
    $scope.abrirCalendarioData = false;                                             
    $scope.exibeTela = false;  
    var obtendoLista = false; 
    var conectando = false;                                            
 
                                                
    // Inicialização do controller
    $scope.administrativo_monitorCargasBootInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Monitor';                          
        $scope.pagina.subtitulo = 'Monitor de Cargas do Boot';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $scope.monitor.desconectar();
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    buscaFiliais();
                    /*if($scope.monitor.isConnected()){
                        obtendoLista = true;
                        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
                        $scope.showProgress(divPortletBodyMonitorPos);
                        $scope.monitor.obtemLista(obtemFiltroBusca());
                    }*/
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = [];
                    $scope.adquirentes = [];
                    $scope.filtro.filial = $scope.filtro.adquirente = null;
                    $scope.monitorCargas = [];
                }
            }
        }); 
        $rootScope.$on('notifyMonitorFalha', function(event, error){
            console.log("FALHA AO OBTER LISTA");
            console.log(error);
            // Esconde Progress
            $scope.hideProgress(divPortletBodyFiltrosPos);
            $scope.hideProgress(divPortletBodyMonitorPos);
            // Exibe mensagem de erro
            $scope.showAlert('Houve uma falha ao obter dados de monitor de cargas', true, 'danger', true);
        });
        $rootScope.$on('notifyMonitorMudancas', function(event, mudancas){
            //console.log("RECEBEU MUDANÇAS");
            //console.log(mudancas);
            mudancasNaListaMonitorCargas(mudancas);
            //$rootScope.$apply();
        });
        $rootScope.$on('notifyMonitorLista', function(event, lista){
            //console.log("RECEBEU LISTA");
            obtendoLista = false;
            // Prepara a lista para exibição
            atualizaListaMonitorCargas(lista);
            // Esconde Progress
            $scope.hideProgress(divPortletBodyFiltrosPos);
            $scope.hideProgress(divPortletBodyMonitorPos);
            //$rootScope.$apply();
        });
        $rootScope.$on('notifyMonitorConnectionStatus', function(event, conectado){
            conectando = false;
            if(conectado){ 
                //console.log("CONECTADO");
                obtendoLista = true;
                $scope.monitor.obtemLista(obtemFiltroBusca());
            }//else console.log("NÃO CONECTADO!"); 
            //$rootScope.$apply();
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Conecta e obtém lista
            if($scope.usuariologado.grupoempresa){
                buscaFiliais();
                //$scope.showProgress(divPortletBodyFiltrosPos, 10000);
                //$scope.showProgress(divPortletBodyMonitorPos);
                //conectando = true;
                //$scope.monitor.conectar(); 
            }
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        /*$scope.exibeTela = true;
        if($scope.usuariologado.grupoempresa){
            buscaFiliais();
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyMonitorPos);
            conectando = true;
            $scope.monitor.conectar(); 
        }*/
    } 
    
    
    
    
    
    
    /* FILTRO */
    
    $scope.totalDiasMesFiltrado = function(){
        return $scope.monitor.getTotalDiasMesFiltrado();    
    }
    
    $scope.getAnoMesFiltrado = function(){
        var periodo = $scope.monitor.getMesAnoFiltrado(); 
        var ano = parseInt(periodo.substr(0, 4));
        var mes = parseInt(periodo.substr(4, 2));
        return $locale.DATETIME_FORMATS.MONTH[mes - 1] + ' de ' + ano;
    }
    
    var obtemFiltroBusca = function(){
        var filtro = {data : $scope.getFiltroData($scope.filtro.data, true),
                      status : '',
                      idGrupo : 0,
                      nuCnpj: '',
                      cdAdquirente : 0 };
        
        //console.log(filtro);
        
        // Status
        if($scope.filtro.status && $scope.filtro.status !== null) 
            filtro.status = $scope.filtro.status.id; 
        // Grupo Empresa
        if($scope.usuariologado.grupoempresa && $scope.usuariologado.grupoempresa !== null)
            filtro.idGrupo = $scope.usuariologado.grupoempresa.id_grupo;
        // Filial
        if($scope.filtro.filial && $scope.filtro.filial !== null) 
            filtro.nuCnpj = $scope.filtro.filial.nu_cnpj;
        // Adquirente
        if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) 
            filtro.cdAdquirente = $scope.filtro.adquirente.cdAdquirente;
        
        return filtro;
    }
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data
        //$scope.filtro.data = new Date();
        
        $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.status = null;
        
        // Relista
        obtemListaMonitorCarga();
        
    }
    
    // DATA
    $scope.exibeCalendario = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendario = !$scope.abrirCalendario;
    };
    $scope.alterouData = function(){
        //console.log($scope.filtro.data);
    };

    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj, cdAdquirente){

        if(!$scope.usuariologado.grupoempresa){ 
            $scope.filiais = [];
            $scope.adquirentes = [];
            $scope.filtro.filial = $scope.filtro.adquirente = null;
            return; 
        }
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
       if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;//$scope.filiais[0];
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                //if($scope.filtro.filial && $scope.filtro.filial !== null)
                buscaAdquirentes(true, cdAdquirente); // Busca adquirentes
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 if(!conectando && !obtendoLista) $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial); 
        buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){
 
       if(!$scope.usuariologado.grupoempresa){ 
            $scope.adquirentes = [];
            $scope.filtro.adquirente = null;
            return; 
        }  
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
        var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1}];
        
        if($scope.filtro.filial && $scope.filtro.filial !== null){
           // Filtro do grupo empresa => barra administrativa
           filtros.push({id: /*$campos.card.tbadquirente.cnpj*/ 305,
                         valor: $scope.filtro.filial.nu_cnpj});
        }   

        $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 1, /*$campos.card.tbadquirente.dsAdquirente*/ 102, 0],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(typeof cdAdquirente === 'number') 
                    $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.id === idOperadora;})[0];
                else $scope.filtro.adquirente = null;
                if(!conectando && !obtendoLista) $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 if(!conectando && !obtendoLista) $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        // ...
    };
        
                                                
                                                
                                                
    // MONITOR DE CARGAS
    $scope.buscaListaMonitor = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        obtemListaMonitorCargas();        
    }
                                                
    var obtemListaMonitorCargas = function(){
        if(!$scope.usuariologado.grupoempresa) return;
        if($scope.monitor && $scope.monitor !== null){
            if($scope.monitor.isConnected()){ 
				//console.log("ESTÁ CONECTADO! OBTENDO LISTA...");
				$scope.showProgress(divPortletBodyFiltrosPos, 10000);
                $scope.showProgress(divPortletBodyMonitorPos);
                obtendoLista = true;
				$scope.monitor.obtemLista(obtemFiltroBusca());
			}else if(!conectando){ 
				//console.log("CONECTANDO...");
				$scope.showProgress(divPortletBodyFiltrosPos, 10000);
                $scope.showProgress(divPortletBodyMonitorPos);
                conectando = true;
				$scope.monitor.conectar();
			}
        }
    }
    /**
      * A partir da lista recebida do filtro,
      * processa os logExecutions para todos os dias do mês
      */
    var atualizaListaMonitorCargas = function(lista){
        /*var oldlist = [];
        angular.copy(lista, oldlist);
        console.log("LISTA");console.log(oldlist);*/
        
        if(!lista || lista === null) return;
        
        
        var totalDias = $scope.totalDiasMesFiltrado();
        
        $scope.diasMesFiltrado = [];
        for(var k = 1; k <= totalDias; k++) $scope.diasMesFiltrado.push(k);
        
        for(var k = 0; k < lista.length; k++){
            var loginAdquirenteEmpresa = lista[k];
            //console.log(loginoperadora);
            // Coloca para todos os dias
            var logs = [];
            var cont = 0;
            var tbLogCarga = loginAdquirenteEmpresa.tbLogCargas[cont];
            //console.log(logExecution);
            var dt = $scope.getDataString(tbLogCarga.dtCompetencia);
            var dia = parseInt(dt.substr(0, dt.indexOf('/')));
            //console.log("DIA L: " + dia);
            for(var d = 1; d <= totalDias; d++){
                 //console.log("DIA: " + d + " ? A " + dia);   
                 if(d === dia){
                     // Para cada modalidade...
                     // Valores pagos -> antecipação
                     var pagosantecipacao = false;
					 try{ pagosantecipacao = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'ANTECIPAÇÃO' || d.dsModalidade === 'ARQUIVOS'})[0] }catch(ex){};
                     if(!pagosantecipacao) pagosantecipacao = {};
                     else pagosantecipacao.flSucesso = tbLogCarga.flStatusPagosAntecipacao;
                     // // Valores pagos -> crédito
                     var pagoscredito = false;
					 try{ pagoscredito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'CRÉDITO' || d.dsModalidade === 'CRÉDITO/DÉBITO' || d.dsModalidade === 'ARQUIVOS' || d.dsModalidade === 'AJUSTES E TARIFAS'})[0]; }catch(ex){};
                     if(!pagoscredito) pagoscredito = {};
                     else pagoscredito.flSucesso = tbLogCarga.flStatusPagosCredito;
                     // Valores pagos -> débito
                     var pagosdebito = false;
					 try{ pagosdebito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'CRÉDITO/DÉBITO' || d.dsModalidade === 'ARQUIVOS' || d.dsModalidade === 'AJUSTES E TARIFAS'})[0]; }catch(ex){};
                     if(!pagosdebito) pagosdebito = {};
                     else pagosdebito.flSucesso = tbLogCarga.flStatusPagosDebito;
                     // Lançamentos futuros
                     var areceber = false;
					 try{ areceber = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'LANÇAMENTOS FUTUROS'})[0]; }catch(ex){};
                     if(!areceber) areceber = {};
                     else areceber.flSucesso = tbLogCarga.flStatusReceber;
                     // Venda à débito
                     var vendadebito = false;
					 try{ vendadebito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'DÉBITO' || d.dsModalidade === 'ARQUIVOS' || (loginAdquirenteEmpresa.tbAdquirente.nmAdquirente !== 'REDE' && d.dsModalidade === 'VENDA')})[0]; }catch(ex){};
                     if(!vendadebito) vendadebito = {};
                     else vendadebito.flSucesso = tbLogCarga.flStatusVendasDebito;
                     // Vendas à crédito
                     var vendacredito = false;
					 try{ vendacredito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'VENDA' || d.dsModalidade === 'ARQUIVOS'})[0]; }catch(ex){};
                     if(!vendacredito) vendacredito = {};
                     else vendacredito.flSucesso = tbLogCarga.flStatusVendasCredito;
                     
                     // tira da definição o array
                     tbLogCarga.tbLogCargasDetalheMonitor = undefined; 
                     // Define eles como estáticos
                     tbLogCarga['PAGOS ANTECIPAÇÃO'] = pagosantecipacao;
                     tbLogCarga['PAGOS CRÉDITO'] = pagoscredito;
                     tbLogCarga['PAGOS DÉBITO'] = pagosdebito;
                     tbLogCarga['LANÇAMENTOS FUTUROS'] = areceber;
                     tbLogCarga['VENDA CRÉDITO'] = vendacredito;
                     tbLogCarga['VENDA DÉBITO'] = vendadebito;
                     
                     logs.push(tbLogCarga);
                     //console.log("TEM!");
                     if(cont < loginAdquirenteEmpresa.tbLogCargas.length - 1){
                         tbLogCarga = loginAdquirenteEmpresa.tbLogCargas[++cont];
                         //console.log(logExecution);
                         dt = $scope.getDataString(tbLogCarga.dtCompetencia);
                         dia = parseInt(dt.substr(0, dt.indexOf('/')));
                         //console.log("NEW DIA L: " + dia);
                     }
                 }else{
                     logs.push({});
                     //console.log("NAO TEM!");    
                 }
            }
            //console.log(logs);
            loginAdquirenteEmpresa.tbLogCargas = logs;
        }
        $scope.monitorCargas = lista;
        //console.log("MONITOR CARGAS");console.log($scope.monitorCargas);
        
        // Set valores de exibição
        $scope.filtro.total_registros = $scope.monitorCargas.length;
        $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
        if($scope.monitorCargas.length === 0) $scope.filtro.faixa_registros = '0-0';
        else{
            var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
            var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
            if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
            $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
        }

        // Verifica se a página atual é maior que o total de páginas
        //if($scope.filtro.pagina > $scope.filtro.total_paginas)
        //    setPagina(1); // volta para a primeira página e refaz a busca
        
        // Atualiza página
        //$rootScope.$apply();
        if(!$scope.$$phase) $scope.$apply();
    }
    
    var mudancasNaListaMonitorCargas = function(mudancas){
        
        if(!mudancas || mudancas === null) return;
        
        //console.log(mudancas);
        
        var linhasPromovidas = 0;
        
        // Atualiza
        for(var k = 0; k < mudancas.objetos.length; k++){
            var obj = mudancas.objetos[k];
            //console.log(obj);
            //var loginoperadora = $filter('filter')($scope.monitorCargas, function(l){return l.id === obj.id})[0];
            var loginAdquirenteEmpresa = $filter('filter')($scope.monitorCargas, function(l){return l.empresa.nu_cnpj === obj.empresa.nu_cnpj && l.tbAdquirente.cdAdquirente === obj.tbAdquirente.cdAdquirente})[0];
            var promoveLoginAdquirenteEmpresa = false;
            if(loginAdquirenteEmpresa){
                for(var j = 0; j < obj.tbLogCargas.length; j++){
                    var tbLogCarga = obj.tbLogCargas[j];
                    var dt = $scope.getDataString(tbLogCarga.dtCompetencia);
                    var dia = parseInt(dt.substr(0, dt.indexOf('/')));
                    
                    if(mudancas.NotificationInfo === 'DELETE'){
                        // "Deleta"
                        loginAdquirenteEmpresa.tbLogCargas[dia - 1] = {}; 
                        promoveLoginAdquirenteEmpresa = true;
                    }else if(mudancas.NotificationInfo === 'INSERT' || mudancas.NotificationInfo === 'UPDATE'){
                        // Novo registro ou Alteração
                        
                         var oldtbLogCarga = loginAdquirenteEmpresa.tbLogCargas[dia - 1];
                        
                         // Para cada modalidade...
                         // Valores pagos -> antecipação
                         var pagosantecipacao = false;
                         try{ pagosantecipacao = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'ANTECIPAÇÃO' || d.dsModalidade === 'ARQUIVOS'})[0] }catch(ex){};
                         if(pagosantecipacao) pagosantecipacao.flSucesso = tbLogCarga.flStatusPagosAntecipacao;
                         // // Valores pagos -> crédito
                         var pagoscredito = false;
                         try{ pagoscredito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'CRÉDITO' || d.dsModalidade === 'CRÉDITO/DÉBITO' || d.dsModalidade === 'ARQUIVOS' || d.dsModalidade === 'AJUSTES E TARIFAS'})[0]; }catch(ex){};
                         if(pagoscredito) pagoscredito.flSucesso = tbLogCarga.flStatusPagosCredito;
                         // Valores pagos -> débito
                         var pagosdebito = false;
                         try{ pagosdebito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'CRÉDITO/DÉBITO' || d.dsModalidade === 'ARQUIVOS' || d.dsModalidade === 'AJUSTES E TARIFAS'})[0]; }catch(ex){};
                         if(pagosdebito) pagosdebito.flSucesso = tbLogCarga.flStatusPagosDebito;
                         // Lançamentos futuros
                         var areceber = false;
                         try{ areceber = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'LANÇAMENTOS FUTUROS'})[0]; }catch(ex){};
                         if(areceber) areceber.flSucesso = tbLogCarga.flStatusReceber;
                         // Venda à débito
                         var vendadebito = false;
                         try{ vendadebito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'DÉBITO' || d.dsModalidade === 'ARQUIVOS' || (loginAdquirenteEmpresa.tbAdquirente.nmAdquirente !== 'REDE' && d.dsModalidade === 'VENDA')})[0]; }catch(ex){};
                         if(vendadebito) vendadebito.flSucesso = tbLogCarga.flStatusVendasDebito;
                         // Vendas à crédito
                         var vendacredito = false;
                         try{ vendacredito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'VENDA' || d.dsModalidade === 'ARQUIVOS'})[0]; }catch(ex){};
                         if(vendacredito) vendacredito.flSucesso = tbLogCarga.flStatusVendasCredito;
                         /*var pagosantecipacao = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'ANTECIPAÇÃO'})[0];
                         if(pagosantecipacao) pagosantecipacao.flSucesso = tbLogCarga.flStatusPagosAntecipacao;
                         // // Valores pagos -> crédito
                         var pagoscredito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'CRÉDITO' || d.dsModalidade === 'CRÉDITO/DÉBITO'})[0];
                         if(pagoscredito) pagoscredito.flSucesso = tbLogCarga.flStatusPagosCredito;
                         // Valores pagos -> débito
                         var pagosdebito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'CRÉDITO/DÉBITO'})[0];
                         if(pagosdebito) pagosdebito.flSucesso = tbLogCarga.flStatusPagosDebito;
                         // Lançamentos futuros
                         var areceber = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'LANÇAMENTOS FUTUROS'})[0];
                         if(areceber) areceber.flSucesso = tbLogCarga.flStatusReceber;
                         // Venda à débito
                         var vendadebito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'DÉBITO'  || (loginAdquirenteEmpresa.tbAdquirente.nmAdquirente !== 'REDE' && d.dsModalidade === 'VENDA')})[0];
                         if(vendadebito) vendadebito.flSucesso = tbLogCarga.flStatusVendasDebito;
                         // Vendas à crédito
                         var vendacredito = $filter('filter')(tbLogCarga.tbLogCargasDetalheMonitor, function(d){return d.dsModalidade === 'VENDA'})[0];
                         if(vendacredito) vendacredito.flSucesso = tbLogCarga.flStatusVendasCredito;*/

                         // tira da definição o array
                         tbLogCarga.tbLogCargasDetalheMonitor = undefined; 
                         // Define eles como estáticos
                         tbLogCarga['PAGOS ANTECIPAÇÃO'] = pagosantecipacao ? pagosantecipacao : oldtbLogCarga['PAGOS ANTECIPAÇÃO'];
                         tbLogCarga['PAGOS CRÉDITO'] = pagoscredito ? pagoscredito : oldtbLogCarga['PAGOS ANTECIPAÇÃO'];
                         tbLogCarga['PAGOS DÉBITO'] = pagosdebito ? pagosdebito : oldtbLogCarga['PAGOS DÉBITO'];
                         tbLogCarga['LANÇAMENTOS FUTUROS'] = areceber ? areceber : oldtbLogCarga['LANÇAMENTOS FUTUROS'];
                         tbLogCarga['VENDA CRÉDITO'] = vendacredito ? vendacredito : oldtbLogCarga['VENDA CRÉDITO'];
                         tbLogCarga['VENDA DÉBITO'] = vendadebito ? vendadebito : oldtbLogCarga['VENDA DÉBITO'];
                        
                         loginAdquirenteEmpresa.tbLogCargas[dia - 1] = tbLogCarga; 
                         promoveLoginAdquirenteEmpresa = true;    
                    }
                }
                // Promover ?
                if(promoveLoginAdquirenteEmpresa){
                    linhasPromovidas++;
                    // Remove da posição corrente
                    var index =  $scope.monitorCargas.indexOf(loginAdquirenteEmpresa);
                    $scope.monitorCargas.splice(index, 1);
                    // Adiciona no topo
                    $scope.monitorCargas.splice(0, 0, loginAdquirenteEmpresa);
                    // Atualiza página 
                    if(!$scope.$$phase) $scope.$apply();
                }
            }
        }
        // Efeito nas linhas afetadas
        for(var k = 0; k < linhasPromovidas; k++){
            $('#tabelaMonitorCargas > tr').eq(k).css("background-color", "#e4b9c0 !important");//"#ccff00 !important");   
        }
        if(!$scope.$$phase) $scope.$apply();
        
        // Espera 5 segundos para retirar as cores
        $timeout(function(){
                    for(var k = 0; k < $scope.monitorCargas.length; k++){
                        $('#tabelaMonitorCargas > tr').eq(k).css("background-color", k % 2 === 0 ? "#ffffff !important" : "#f9f9f9 !important");
                    }
                    if(!$scope.$$phase) $scope.$apply();
                 }, 5000);
    }
    
    
    
    
    $scope.teveProcessamento = function(detalhe){
        if(detalhe && typeof detalhe.flSucesso !== 'undefined') return true;       
        return false;
    }
    
    
    
    
    // AUDITORIA
    var fechaModalDataRecebimento = function(){
        $('#modalAuditoria').modal('hide');    
    }
    var exibeModalDataRecebimento = function(){
        $('#modalAuditoria').modal('show');    
    }
    
    $scope.exibeModalAuditoria = function(empresa, tbAdquirente, modalidade, tbLogCarga){
        if(!tbLogCarga || tbLogCarga === null) return;
        $scope.modalAuditoria.detalhe = tbLogCarga[modalidade];
        $scope.modalAuditoria.adquirente = tbAdquirente.nmAdquirente;
        $scope.modalAuditoria.empresa = $scope.getNomeAmigavelFilial(empresa);
        $scope.modalAuditoria.modalidade = modalidade;
        $scope.modalAuditoria.dtCompetencia = tbLogCarga.dtCompetencia;
        
        //console.log(tbLogCarga[modalidade].txAuditoria);
        
        exibeModalDataRecebimento();
    }
                                                
                                                

}]);