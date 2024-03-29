/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.3 - 22/09/2015
 *  - Ajuste da exportação: não aciona o ws
 *
 *  Versão 1.0.2 - 22/09/2015
 *  - Exportar para CSV
 *
 *  Versão 1.0.1 - 18/09/2015
 *  - Busca somente filiais ativas
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("card-services-consolidacao-relatorios", []) 

.controller("card-services-consolidacao-relatoriosCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             '$autenticacao',             
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis,$autenticacao){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.filiais = $scope.adquirentes = $scope.bandeiras =  $scope.terminais = [];                                          
    $scope.camposBusca = [
                          {
                            id: /*$campos.pos.recebimento.cdAutorizador*/ 104, 
                            nome: "Código Autorizador"
                          },{
                            id: /*$campos.pos.recebimento.nsu*/ 103,
                            nome: "NSU"
                          }
                         ]; 
    $scope.filtro = {datamin : new Date(), datamax : '', 
                     filial : null, adquirente : null,
                     bandeira : null, terminallogico : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     busca : '', campo_busca : $scope.camposBusca[1],
                     terminal :  { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                     sintetico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                     analitico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                    };
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                           
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress
    $scope.tab = 1; // init Sintético
    
    // Relatórios
    $scope.relatorio = {terminal : [], sintetico : [], analitico : []};                                             
    // Totais
    $scope.total = {terminal  : {totalTransacoes : 0, valorBruto : 0, 
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    sintetico : {totalTransacoes : 0, valorBruto : 0,
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    analitico : {valorBruto : 0, valorBrutoFiltrado : 0}};                                              
    // flag
    var ultimoFiltro = undefined;
    $scope.exibeTela = false;  
    $scope.buscandoRelatorio = false;                                             
                                                 
                                                 
    // Inicialização do controller
    $scope.cardServices_consolidacao_relatoriosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Consolidação - Relatórios';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = $scope.filtro.terminallogico = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.adquirentes = [];
                    $scope.bandeiras = [];
                    $scope.terminais = [];
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            if($scope.usuariologado.grupoempresa) buscaFiliais();
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Carrega filiais
        //if($scope.usuariologado.grupoempresa) buscaFiliais(true);
    };
    
                                                 
                                                 
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.filtro.busca = '';
        $scope.buscaRelatorio();
    };                                             
                                                 
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        ultimoFiltro = undefined;
        
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = $scope.filtro.terminallogico = null; 

        /*if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }*/
        // Limpa relatórios
        $scope.relatorio.analitico = [];
        $scope.relatorio.sintetico = [];
        $scope.relatorio.terminal = [];
        $scope.filtro.analitico.pagina = $scope.filtro.sintetico.pagina = $scope.filtro.terminal.pagina = 1;
        $scope.filtro.analitico.total_registros = $scope.filtro.sintetico.total_registros = $scope.filtro.terminal.total_registros = 0;
        $scope.filtro.analitico.faixa_registros = $scope.filtro.sintetico.faixa_registros = $scope.filtro.terminal.faixa_registros = '0-0';
        $scope.filtro.analitico.total_paginas = $scope.filtro.sintetico.total_paginas = $scope.filtro.terminal.total_paginas = 0;
    }
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
       if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
       else ajustaIntervaloDeData();
    };
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj, idBandeira){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                //$scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                if($scope.filtro.filial && $scope.filtro.filial !== null)
                    buscaAdquirentes(true, idBandeira); // Busca adquirentes
                else
                    $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
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
    var buscaAdquirentes = function(progressEstaAberto, idOperadora, idBandeira, idTerminalLogico){
 
       if(!$scope.filtro.filial || $scope.filtro.filial === null){
           $scope.filtro.adquirente = $scope.filtro.bandeira = null;
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;


       // Filtro do grupo empresa => barra administrativa
       filtros = {id: 300,
                 //id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                  valor: $scope.filtro.filial.nu_cnpj};
       
       $webapi.get($apis.getUrl($apis.pos.operadora, 
                                [$scope.token, 0, /*$campos.pos.operadora.nmOperadora*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(!idOperadora) $scope.filtro.adquirente = null;
                else $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.id === idOperadora;})[0];
                // Busca bandeiras
                if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) 
                    buscaBandeiras(true, true, idBandeira, idTerminalLogico);
                else
                    $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(idBandeira, idTerminalLogico, progressEstaAberto){
        $scope.bandeiras = []; 
        $scope.terminais = [];
        $scope.filtro.bandeira = $scope.filtro.terminallogico = null;
        if($scope.filtro.adquirente !== null)
            buscaBandeiras(progressEstaAberto, true, idBandeira, idTerminalLogico);
    };
                
                                                 
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, buscarTerminaisLogicos, idBandeira, idTerminalLogico){
       
       if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null){
           $scope.filtro.bandeira = null;
           $scope.bandeiras = [];
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;

       // Filtro de adquirente
       if($scope.filtro.adquirente !== null) filtros = {id: /*$campos.pos.bandeirapos.idOperadora*/ 102, 
                                                        valor: $scope.filtro.adquirente.id};
       
       $webapi.get($apis.getUrl($apis.pos.bandeirapos, 
                                [$scope.token, 0, /*$campos.pos.bandeirapos.desBandeira*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.bandeiras = dados.Registros;
                // Reseta ou seta para um objeto
                if(typeof idBandeira === 'number' && idBandeira > 0){ 
                    $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.id === idBandeira;})[0];
                    if(!$scope.filtro.bandeira) $scope.filtro.bandeira = null;
                }else $scope.filtro.bandeira = null;
                // Esconde o progress
                if(buscarTerminaisLogicos) buscaTerminaisLogicos(true, idTerminalLogico);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma bandeira
      */
    $scope.alterouBandeira = function(){
        //console.log($scope.filtro.bandeira);    
    }; 
                                                 
                                                 
    // TERMINAL LÓGICO                                           
    /**
      * Busca as bandeiras
      */                                             
    var buscaTerminaisLogicos = function(progressEstaAberto, idTerminalLogico){

       if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null){
           $scope.filtro.terminallogico = null;
           $scope.terminais = [];
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        
       var filtros = undefined;

       // Filtro de adquirente
       if($scope.filtro.adquirente !== null) filtros = {id: 102,//$campos.pos.terminallogico.idOperadora, 
                                                        valor: $scope.filtro.adquirente.id};
       
       $webapi.get($apis.getUrl($apis.pos.terminallogico, 
                                [$scope.token, 2, 101],//$campos.pos.terminallogico.dsTerminalLogico],
                                filtros)) 
            .then(function(dados){
                $scope.terminais = dados.Registros;
                // Reseta ou seta para um objeto
                if(typeof idTerminalLogico === 'number' && idTerminalLogico > 0){ 
                    $scope.filtro.terminallogico = $scope.filtro.terminallogico = $filter('filter')($scope.terminais, function(t) {return t.idTerminalLogico === idTerminalLogico;})[0]; 
                    if(!$scope.filtro.terminallogico) $scope.filtro.terminallogico = null;
                }else $scope.filtro.terminallogico = null;
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter terminais lógicos (' + failData.status + ')', true, 'danger', true);
                 // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };                                             
    $scope.alterouTerminalLogico = function(){
        //console.log($scope.filtro.terminallogico);
        // Rebusca
    };
      
                                                 

    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       var totalPaginas = $scope.tabIs(0) ? $scope.filtro.terminal.total_paginas :
                          $scope.tabIs(1) ? $scope.filtro.sintetico.total_paginas : 
                          $scope.tabIs(2) ? $scope.filtro.analitico.total_paginas : 0;
       if(pagina >= 1 && pagina <= totalPaginas){ 
           if($scope.tabIs(0)){ 
               $scope.filtro.terminal.pagina = pagina;
               if($scope.relatorio.terminal.length > 0) buscaRelatorioTerminal(false);
           }else if($scope.tabIs(1)){ 
               $scope.filtro.sintetico.pagina = pagina;
               if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(false);
           }else if($scope.tabIs(2)){ 
               $scope.filtro.analitico.pagina = pagina;
               if($scope.relatorio.analitico.length > 0) buscaRelatorioAnalitico(false, false);
           }
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        var pagina = $scope.tabIs(0) ? $scope.filtro.terminal.pagina :
                     $scope.tabIs(1) ? $scope.filtro.sintetico.pagina : 
                     $scope.tabIs(2) ? $scope.filtro.analitico.pagina : 0;
        setPagina(pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        var pagina = $scope.tabIs(0) ? $scope.filtro.terminal.pagina :
                     $scope.tabIs(1) ? $scope.filtro.sintetico.pagina : 
                     $scope.tabIs(2) ? $scope.filtro.analitico.pagina : 0;
        setPagina(pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.tabIs(0) ? $scope.filtro.terminal.pagina :
                                 $scope.tabIs(1) ? $scope.filtro.sintetico.pagina : 
                                 $scope.tabIs(2) ? $scope.filtro.analitico.pagina : 1; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        alteraFiltroDeBusca();
    };                                             
                                                 
    
    // TABS
    /**
      * Seta a tab
      */
    $scope.setTab = function(tab){
        if(typeof tab === 'number' && tab >= 0 && tab < 3){ 
            $scope.tab = tab;
            if($scope.tabIs(0)){
                $scope.paginaInformada = $scope.filtro.terminal.pagina;
                if($scope.relatorio.terminal.length == 0 && 
                   ($scope.relatorio.sintetico.length > 0 || 
                    $scope.relatorio.analitico.length > 0)) 
                        buscaRelatorioTerminal(false);   
            }else if($scope.tabIs(1)){
                $scope.paginaInformada = $scope.filtro.sintetico.pagina;
                if($scope.relatorio.sintetico.length == 0 && 
                   ($scope.relatorio.terminal.length > 0 || 
                    $scope.relatorio.analitico.length > 0)) 
                        buscaRelatorioSintetico(false);   
            }else if($scope.tabIs(2)){
                $scope.paginaInformada = $scope.filtro.analitico.pagina;
                if($scope.relatorio.analitico.length == 0 && 
                   ($scope.relatorio.terminal.length > 0 || 
                    $scope.relatorio.sintetico.length > 0)) 
                        buscaRelatorioAnalitico(false, false);   
            }
        }
    }
    /**
      * Retorna true se a tab selecionada é inforamda
      */
    $scope.tabIs = function(tab){
        return $scope.tab === tab;
    }
    
    
    
    // BUSCA
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = undefined;
       // Data
       var filtroData = {id: /*$campos.pos.recebimento.dtaVenda*/ 105,
                         valor: $scope.getFiltroData($scope.filtro.datamin)}; 
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros = [filtroData];
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: /*$campos.pos.recebimento.cnpj*/ 102, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: 300,//$campos.pos.recebimento.operadora + $campos.pos.operadora.id - 100, 
                                   valor: $scope.filtro.adquirente.id};
           filtros.push(filtroAdquirente);
       } 
        
       // Bandeira
       if($scope.filtro.bandeira !== null){
           var filtroBandeira = {id: /*$campos.pos.recebimento.idBandeira*/ 101, 
                                 valor: $scope.filtro.bandeira.id};
           filtros.push(filtroBandeira);
       }
        
       // Terminal Lógico
       if($scope.filtro.terminallogico !== null){
           var filtroTerminal = {id: /*$campos.pos.recebimento.idLogicoTerminal*/ 110, 
                                 valor: $scope.filtro.terminallogico.idTerminalLogico};
           filtros.push(filtroTerminal);
       }  
        
       // Verifica se tem algum valor para ser filtrado (NSU ou Cod. Autorizador)   
       if($scope.filtro.busca.length > 0) 
           filtros.push({id: $scope.filtro.campo_busca.id, valor: $scope.filtro.busca + '%'});   
       
       // Retorna    
       return filtros;
    };
    
    var alteraFiltroDeBusca = function(){
        if($scope.usuariologado.grupoempresa){
            if($scope.tabIs(0)){
                if($scope.relatorio.terminal.length > 0) buscaRelatorioTerminal(true);
            }else if($scope.tabIs(1)){
                if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(true);
            }else if($scope.tabIs(2)){
                if($scope.relatorio.analitico.length > 0) buscaRelatorioAnalitico(true, true);
            }
        }    
    };
    
    /**
      * Obtem o relatório
      */
    $scope.buscaRelatorio = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        /*if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
        }*/
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        // Nova busca
        if($scope.tabIs(0)) buscaRelatorioTerminal(true);
        else if($scope.tabIs(1)) buscaRelatorioSintetico(true);
        else if($scope.tabIs(2)) buscaRelatorioAnalitico(true, true);
    };
                                                 
    // TERMINAL LÓGICO
    /**
      * Busca o relatório agrupado por terminal lógico
      */
    var buscaRelatorioTerminal = function(resetaOutrosRelatorios){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.pos.recebimento, 
                                [$scope.token, 3, 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.terminal.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.terminal.totalTransacoes = $scope.total.terminal.valorBruto = 0;
                // Obtém os dados
                $scope.relatorio.terminal = dados.Registros;
                // Obtém os totais
                $scope.total.terminal.totalTransacoesFiltrado = dados.Totais.totalTransacoes;
                $scope.total.terminal.valorBrutoFiltrado = dados.Totais.valorBruto;
           
                // Set valores de exibição
                $scope.filtro.terminal.total_registros = dados.TotalDeRegistros;
                $scope.filtro.terminal.total_paginas = Math.ceil($scope.filtro.terminal.total_registros / $scope.filtro.itens_pagina);
                if($scope.relatorio.terminal.length === 0) $scope.filtro.terminal.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.terminal.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.terminal.total_registros) registroFinal = $scope.filtro.terminal.total_registros;
                    $scope.filtro.terminal.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.terminal.pagina > $scope.filtro.terminal.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaOutrosRelatorios){
                    $scope.relatorio.analitico = [];
                    $scope.relatorio.sintetico = [];
                    $scope.filtro.analitico.pagina = $scope.filtro.sintetico.pagina = 1;
                    $scope.filtro.analitico.total_registros = $scope.filtro.sintetico.total_registros = 0;
                    $scope.filtro.analitico.faixa_registros = $scope.filtro.sintetico.faixa_registros = '0-0';
                    $scope.filtro.analitico.total_paginas = $scope.filtro.sintetico.total_paginas = 0;
                }
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 // Reseta valores
                 $scope.relatorio.terminal = [];
                 $scope.filtro.terminal.pagina = 1;
                 $scope.filtro.terminal.total_registros = 0;
                 $scope.filtro.terminal.faixa_registros = '0-0';
                 $scope.filtro.terminal.total_paginas = 0;
           
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório por terminal lógico (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
    
    // SINTÉTICO 
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioSintetico = function(resetaOutrosRelatorios){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $webapi.get($apis.getUrl($apis.pos.recebimento, 
                                [$scope.token, 4, 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.sintetico.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.sintetico.totalTransacoes = $scope.total.sintetico.valorBruto = 0;
                // Obtém os dados
                $scope.relatorio.sintetico = dados.Registros;
                // Obtém os totais
                $scope.total.sintetico.totalTransacoesFiltrado = dados.Totais.totalTransacoes;
                $scope.total.sintetico.valorBrutoFiltrado = dados.Totais.valorBruto;
           
                // Set valores de exibição
                $scope.filtro.sintetico.total_registros = dados.TotalDeRegistros;
                $scope.filtro.sintetico.total_paginas = Math.ceil($scope.filtro.sintetico.total_registros / $scope.filtro.itens_pagina);
                if($scope.relatorio.sintetico.length === 0) $scope.filtro.sintetico.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.sintetico.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.sintetico.total_registros) registroFinal = $scope.filtro.sintetico.total_registros;
                    $scope.filtro.sintetico.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.sintetico.pagina > $scope.filtro.sintetico.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaOutrosRelatorios){
                    $scope.relatorio.analitico = [];
                    $scope.relatorio.terminal = [];
                    $scope.filtro.analitico.pagina = $scope.filtro.terminal.pagina = 1;
                    $scope.filtro.analitico.total_registros = $scope.filtro.terminal.total_registros = 0;
                    $scope.filtro.analitico.faixa_registros = $scope.filtro.terminal.faixa_registros = '0-0';
                    $scope.filtro.analitico.total_paginas = $scope.filtro.terminal.total_paginas = 0;
                }
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 // Reseta valores
                 $scope.relatorio.sintetico = [];
                 $scope.filtro.sintetico.pagina = 1;
                 $scope.filtro.sintetico.total_registros = 0;
                 $scope.filtro.sintetico.faixa_registros = '0-0';
                 $scope.filtro.sintetico.total_paginas = 0;
           
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório sintético (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
    
    // ANALÍTICO
    
     $scope.detalhar = function(nu_cnpj, idOperadora, bandeira, terminal){
         // Tinha filial selecionada e ela era a que está para ser detalhada?
         if(!$scope.filtro.filial || $scope.filtro.filial === null || 
            $scope.filtro.filial.nu_cnpj !== nu_cnpj){
             // Filial diferente!
             $scope.filtro.filial = $filter('filter')($scope.filiais, function(f){return f.nu_cnpj === nu_cnpj;})[0]; 
             buscaAdquirentes(false, idOperadora, bandeira.id, terminal ? terminal.idTerminalLogico : undefined);
             $scope.filtro.adquirente = {id : idOperadora};
             $scope.filtro.bandeira = bandeira;
             if(terminal) $scope.filtro.terminallogico = terminal;
             
             // vai para Analítico
             $scope.setTab(2); 
             buscaRelatorioAnalitico(true, true);
         }else{
             // Procura a adquirente
             var adquirente = $filter('filter')($scope.adquirentes, function(a){return a.id === idOperadora;})[0];
             if(adquirente){ 
                 // vai para Analítico
                 $scope.setTab(2);
                 // Verifica se a adquirente já não estava selecionada
                 if(adquirente !== $scope.filtro.adquirente){
                     $scope.filtro.adquirente = adquirente;
                     // Seta os models para refazer a busca por adquirente
                     $scope.filtro.bandeira = bandeira;
                     if(terminal) $scope.filtro.terminallogico = terminal;
                     // Set o flag
                     adquirente = null;
                }else{
                    // Apenas busca a bandeira e o terminal lógico (se definido)
                    $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.id === bandeira.id;})[0];
                    if(terminal) $scope.filtro.terminallogico = $filter('filter')($scope.terminais, function(t) {return t.idTerminalLogico === terminal.idTerminalLogico;})[0]; 
                }
                // Faz a busca analítica
                if(typeof ultimoFiltro === 'undefined' || !$scope.arraysAreEqual(ultimoFiltro, obtemFiltroDeBusca())) 
                    buscaRelatorioAnalitico(true, true);//resetaTerminal, !resetaTerminal);
                // Carrega o conjunto de bandeiras e de terminais lógicos associados à nova adquirente selecionada
                if(adquirente === null) 
                    $timeout(function(){$scope.alterouAdquirente(bandeira.id, terminal ? terminal.idTerminalLogico : undefined, true)}, 500);
             }else $scope.filtro.adquirente = null;
         }
    };
    
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioAnalitico = function(resetaRelatorioTerminal, resetaRelatorioSintetico){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $webapi.get($apis.getUrl($apis.pos.recebimento, 
                                [$scope.token, 5, /*$campos.pos.recebimento.dtaVenda*/ 105, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.analitico.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.analitico.valorBruto = 0;
                // Obtém os dados
                $scope.relatorio.analitico = dados.Registros;
                // Obtém os totais
                $scope.total.analitico.valorBrutoFiltrado = dados.Totais.valorVendaBruta;
           
                // Set valores de exibição
                $scope.filtro.analitico.total_registros = dados.TotalDeRegistros;
                $scope.filtro.analitico.total_paginas = Math.ceil($scope.filtro.analitico.total_registros / $scope.filtro.itens_pagina);
                if($scope.relatorio.analitico.length === 0) $scope.filtro.analitico.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.analitico.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.analitico.total_registros) registroFinal = $scope.filtro.analitico.total_registros;
                    $scope.filtro.analitico.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.analitico.pagina > $scope.filtro.analitico.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaRelatorioTerminal){
                    $scope.relatorio.terminal = [];
                    $scope.filtro.terminal.pagina = 1;
                    $scope.filtro.terminal.total_registros = 0;
                    $scope.filtro.terminal.faixa_registros = '0-0';
                    $scope.filtro.terminal.total_paginas = 0;
                }
                if(resetaRelatorioSintetico){
                    $scope.relatorio.sintetico = [];
                    $scope.filtro.sintetico.pagina = 1;
                    $scope.filtro.sintetico.total_registros = 0;
                    $scope.filtro.sintetico.faixa_registros = '0-0';
                    $scope.filtro.sintetico.total_paginas = 0;
                }
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 // Reseta valores
                 $scope.relatorio.analitico = [];
                 $scope.filtro.analitico.pagina = 1;
                 $scope.filtro.analitico.total_registros = 0;
                 $scope.filtro.analitico.faixa_registros = '0-0';
                 $scope.filtro.analitico.total_paginas = 0;
           
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório analítico (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
    
    
    
    // EXPORTAR
    /**
      * Exporta o conteúdo do filtro para CSV
      */
    $scope.exportarCSV = function(){
        
        if(!ultimoFiltro || ultimoFiltro === null){
            $scope.showModalAlerta('Pelo menos uma busca deve ser realizada!');  
            return;
        }
        
        var filtros = ultimoFiltro;
        
        // Exportar
        filtros.push({id: /*$campos.pos.recebimentoparcela.exportar*/ 9999,
                      valor : true});
    
        var url = '';
        var filename = '';
            
        if($scope.tabIs(0)){
            // Terminal
            url =$apis.getUrl($apis.pos.recebimento, [$scope.token, 3, 100, 0], filtros);
            filename = 'Consolidacao-Relatorio-Terminal-Logico.csv';
        }else if($scope.tabIs(1)){
            // Sintético
            url = $apis.getUrl($apis.pos.recebimento, [$scope.token, 4, 100, 0], filtros);
            filename = 'Consolidacao-Relatorio-Sintetico.csv';
        }else if($scope.tabIs(2)){ 
            // Analítico
            url = $apis.getUrl($apis.pos.recebimento, 
                               [$scope.token, 5, /*$campos.pos.recebimento.dtaVenda*/ 105, 0], 
                               filtros);
            filename = 'Consolidacao-Relatorio-Analitico.csv';
        }else 
            return;

        // Seta para a url de download
        url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
        
        $scope.buscandoRelatorio = true;
        var funcao = function(){ $scope.buscandoRelatorio = false; };
        
        $scope.download(url, filename, true, divPortletBodyRelatorioPos, divPortletBodyFiltrosPos, funcao, funcao);        
    }
    
}]);