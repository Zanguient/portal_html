/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("card-services-consolidacao-relatorios", []) 

.controller("card-services-consolidacao-relatoriosCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             '$campos',
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,
                                                      $campos,$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [10, 20, 50, 100]; 
    var ordenacao = {terminal : {id: $campos.pos.recebimento.terminallogico + 
                                     $campos.pos.terminallogico.dsTerminalLogico - 100, 
                                 order : 0},
                     terminal : {id: $campos.pos.recebimento.terminallogico + 
                                     $campos.pos.terminallogico.dsTerminalLogico - 100, 
                                 order : 0}
                    };
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.filiais = $scope.adquirentes = $scope.bandeiras =  $scope.terminais = [];                                          
    $scope.filtro = {datamin : new Date(), datamax : '', 
                     filial : null, adquirente : null,
                     bandeira : null, terminallogico : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     campo_ordenacao : {id: $campos.pos.recebimento.terminallogico + $campos.pos.terminallogico.dsTerminalLogico - 100, order : 0},
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
    $scope.total = {terminal  : {totalTransacoes : 0, valorBruto : 0}, 
                    sintetico : {totalTransacoes : 0, valorBruto : 0}, 
                    analitico : {valorBruto : 0}};                                              
                                            
                                                 
                                                 
    // Inicialização do controller
    $scope.cardServices_consolidacao_relatoriosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Consolicação - Relatórios';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Avalia grupo empresa
            if($scope.grupoempresa){ 
                // Reseta seleção de filtro específico de empresa
                $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = $scope.filtro.terminallogico = null;
                buscaFiliais(true);
            }else // reseta tudo e não faz buscas 
                $scope.filiais = $scope.adquirentes = $scope.bandeiras =  $scope.terminais = []; 
        }); 
        // Carrega filiais
        if($scope.grupoempresa) buscaFiliais(true);
    };
    
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.filial = null;
        
        if($scope.filtro.adquirente !== null){
            $scope.filtro.adquirente = null;    
            // Acarreta em mudanças nos filtros de bandeira e terminais lógicos
            buscaBandeiras(true, true);
        }else $scope.filtro.adquirente = null;
        $scope.filtro.bandeira = $scope.filtro.terminallogico = null; 
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
    var buscaFiliais = function(buscarAdquirentes){
        
       $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa) filtros = {id: $campos.cliente.empresa.id_grupo, valor: $scope.grupoempresa.id_grupo};
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, $campos.cliente.empresa.ds_fantasia],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                $scope.filtro.filial = null;
                // Busca adquirentes
                if(buscarAdquirentes) buscaAdquirentes(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial);    
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto){
 
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa) filtros = {id: $campos.pos.operadora.idGrupoEmpresa, valor: $scope.grupoempresa.id_grupo};
       
       $webapi.get($apis.getUrl($apis.pos.operadora, 
                                [$scope.token, 0, $campos.pos.operadora.nmOperadora],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                $scope.filtro.adquirente = null;
                // Busca bandeiras
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(idBandeira, idTerminalLogico){
        //console.log($scope.filtro.adquirente); 
        if($scope.filtro.adquirente !== null){
            buscaBandeiras(true, true, idBandeira, idTerminalLogico);
            //buscaTerminaisLogicos();
        }else{
            // Só exibe filtro de bandeiras e terminais lógicos se existir uma adquirentes válida selecionada
            $scope.filtro.bandeira = $scope.filtro.terminallogico = null;
            $scope.bandeiras = $scope.terminais = [];
        }
    };
                
                                                 
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, buscarTerminaisLogicos, idBandeira, idTerminalLogico){
       
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro de adquirente
       if($scope.filtro.adquirente !== null) filtros = {id: $campos.pos.bandeirapos.idOperadora, valor: $scope.filtro.adquirente.id};
       
       $webapi.get($apis.getUrl($apis.pos.bandeirapos, 
                                [$scope.token, 0, $campos.pos.bandeirapos.desBandeira],
                                filtros)) 
            .then(function(dados){
                $scope.bandeiras = dados.Registros;
                // Reseta ou seta para um objeto
                if(typeof idBandeira === 'number' && idBandeira > 0){ 
                    $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, {id:idBandeira})[0];
                    if(!$scope.filtro.bandeira) $scope.filtro.bandeira = null;
                }else $scope.filtro.bandeira = null;
                // Esconde o progress
                if(buscarTerminaisLogicos) buscaTerminaisLogicos(true, idTerminalLogico);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
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

       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);
        
       var filtros = undefined;

       // Filtro de adquirente
       if($scope.filtro.adquirente !== null) filtros = {id: $campos.pos.terminallogico.idOperadora, valor: $scope.filtro.adquirente.id};
       
       $webapi.get($apis.getUrl($apis.pos.terminallogico, 
                                [$scope.token, 2, $campos.pos.terminallogico.dsTerminalLogico],
                                filtros)) 
            .then(function(dados){
                $scope.terminais = dados.Registros;
                // Reseta ou seta para um objeto
                if(typeof idTerminalLogico === 'number' && idTerminalLogico > 0){ 
                    $scope.filtro.terminallogico = $filter('filter')($scope.terminais, {idTerminalLogico:idTerminalLogico})[0];
                    if(!$scope.filtro.terminallogico) $scope.filtro.terminallogico = null;
                }else $scope.filtro.terminallogico = null;
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
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
               if($scope.relatorio.analitico.length > 0) buscaRelatorioAnalitico(false);
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
        else $scope.setaPaginaDigitada();  
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
                        buscaRelatorioAnalitico(false);   
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
      * Retorna a string aceita para filtro de data
      */
    var getFiltroData = function(data){
        var ano = $scope.filtro.datamin.getFullYear(); 
        var mes = ($scope.filtro.datamin.getMonth() + 1); 
        var dia = $scope.filtro.datamin.getDate(); 
        
        if(ano >= 1000) ano = '' + ano; 
        else if(ano >= 100) ano = '0' + ano;
        else if(ano >= 10) ano = '00' + ano;
        else ano = '000' + ano;
        
        if(mes >= 10) mes = '' + mes;
        else mes = '0' + mes;
        
        if(dia >= 10) dia = '' + dia;
        else dia = '0' + dia;
        
        return ano + mes + dia;
    };
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(incluiTerminalLogico){
       var filtros = undefined;
       // Data
       var filtroData = {id: $campos.pos.recebimento.dtaVenda,
                         valor: getFiltroData($scope.filtro.datamin)}; 
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + getFiltroData($scope.filtro.datamax);
       filtros = [filtroData];
        
       // Filial
       if($scope.filtro.filial !== null){
           var filtroFilial = {id: $campos.pos.recebimento.cnpj, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: $campos.pos.recebimento.operadora + $campos.pos.operadora.id - 100, 
                                   valor: $scope.filtro.adquirente.id};
           filtros.push(filtroAdquirente);
       } 
        
       // Bandeira
       if($scope.filtro.bandeira !== null){
           var filtroBandeira = {id: $campos.pos.recebimento.idBandeira, 
                                 valor: $scope.filtro.bandeira.id};
           filtros.push(filtroBandeira);
       }
        
       // Terminal Lógico
       if(incluiTerminalLogico && $scope.filtro.terminallogico !== null){
           var filtroTerminal = {id: $campos.pos.recebimento.idLogicoTerminal, 
                                 valor: $scope.filtro.terminallogico.idTerminalLogico};
           filtros.push(filtroTerminal);
       }  
       
       // Retorna    
       return filtros;
    };
    
    var alteraFiltroDeBusca = function(){
        if($scope.grupoempresa){
            if($scope.tabIs(0)){
                if($scope.relatorio.terminal.length > 0) buscaRelatorioTerminal(true);
            }else if($scope.tabIs(1)){
                if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(true);
            }else if($scope.tabIs(2)){
                if($scope.relatorio.analitico.length > 0) buscaRelatorioAnalitico(true);
            }
        }    
    };
    
    /**
      * Obtem o relatório
      */
    $scope.buscaRelatorio = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione um grupo empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 30){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 30 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
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
        else if($scope.tabIs(2)) buscaRelatorioAnalitico(true);
    };
                                                 
    // TERMINAL LÓGICO
    /**
      * Busca o relatório agrupado por terminal lógico
      */
    var buscaRelatorioTerminal = function(resetaOutrosRelatorios){
       $scope.showProgress(divPortletBodyFiltrosPos);    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca(true);
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.pos.recebimento, 
                                [$scope.token, 3, 100,//$scope.filtro.campo_ordenacao.id, 
                                 $scope.filtro.campo_ordenacao.order, 
                                 $scope.filtro.itens_pagina, $scope.filtro.terminal.pagina],
                                filtros)) 
            .then(function(dados){
                // Reseta os valores totais
                $scope.total.terminal.totalTransacoes = $scope.total.terminal.valorBruto = 0;
                // Obtém os dados
                $scope.relatorio.terminal = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.terminal.total_registros = dados.TotalDeRegistros;
                $scope.filtro.terminal.total_paginas = Math.ceil($scope.filtro.terminal.total_registros / $scope.filtro.itens_pagina);
                var registroInicial = ($scope.filtro.terminal.pagina - 1)*$scope.filtro.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                if(registroFinal > $scope.filtro.terminal.total_registros) registroFinal = $scope.filtro.terminal.total_registros;
                $scope.filtro.terminal.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoUsuarios = false;
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.terminal.pagina > $scope.filtro.terminal.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaOutrosRelatorios){
                    $scope.relatorio.analitico = $scope.relatorio.sintetico = [];
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
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
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
       $scope.showProgress(divPortletBodyFiltrosPos);    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca(false);
           
       $webapi.get($apis.getUrl($apis.pos.recebimento, 
                                [$scope.token, 4, 100,
                                 $scope.filtro.campo_ordenacao.order, 
                                 $scope.filtro.itens_pagina, $scope.filtro.sintetico.pagina],
                                filtros)) 
            .then(function(dados){
                // Reseta os valores totais
                $scope.total.sintetico.totalTransacoes = $scope.total.sintetico.valorBruto = 0;
                // Obtém os dados
                $scope.relatorio.sintetico = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.sintetico.total_registros = dados.TotalDeRegistros;
                $scope.filtro.sintetico.total_paginas = Math.ceil($scope.filtro.sintetico.total_registros / $scope.filtro.itens_pagina);
                var registroInicial = ($scope.filtro.sintetico.pagina - 1)*$scope.filtro.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                if(registroFinal > $scope.filtro.sintetico.total_registros) registroFinal = $scope.filtro.sintetico.total_registros;
                $scope.filtro.sintetico.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoUsuarios = false;
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.sintetico.pagina > $scope.filtro.sintetico.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaOutrosRelatorios){
                    $scope.relatorio.analitico = $scope.relatorio.terminal = [];
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
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao obter relatório sintético (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
    
    // ANALÍTICO
    
     $scope.detalhar = function(idOperadora, bandeira, terminal){
         // Procura a adquirente
         $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, {id:idOperadora})[0];
         if($scope.filtro.adquirente){ 
             // vai para Analítico
             $scope.setTab(2); 
             // Seta os models
             $scope.filtro.bandeira = bandeira;
             $scope.filtro.terminallogico = terminal ? terminal : null;
             // Faz a busca analítica
             buscaRelatorioAnalitico();
             // Busca paralelamente as bandeiras e os terminais para listar nas combos
             $scope.alterouAdquirente(bandeira.id, terminal ? terminal.idTerminalLogico : undefined);
         }else $scope.filtro.adquirente = null;
    };
    
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioAnalitico = function(resetaOutrosRelatorios){
       $scope.showProgress(divPortletBodyFiltrosPos);    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca(true);
           
       $webapi.get($apis.getUrl($apis.pos.recebimento, 
                                [$scope.token, 5, 100,
                                 $scope.filtro.campo_ordenacao.order, 
                                 $scope.filtro.itens_pagina, $scope.filtro.analitico.pagina],
                                filtros)) 
            .then(function(dados){
                // Reseta os valores totais
                $scope.total.analitico.valorBruto = 0;
                // Obtém os dados
                $scope.relatorio.analitico = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.analitico.total_registros = dados.TotalDeRegistros;
                $scope.filtro.analitico.total_paginas = Math.ceil($scope.filtro.analitico.total_registros / $scope.filtro.itens_pagina);
                var registroInicial = ($scope.filtro.analitico.pagina - 1)*$scope.filtro.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                if(registroFinal > $scope.filtro.analitico.total_registros) registroFinal = $scope.filtro.analitico.total_registros;
                $scope.filtro.analitico.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoUsuarios = false;
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.analitico.pagina > $scope.filtro.analitico.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaOutrosRelatorios){
                    $scope.relatorio.sintetico = $scope.relatorio.terminal = [];
                    $scope.filtro.sintetico.pagina = $scope.filtro.terminal.pagina = 1;
                    $scope.filtro.sintetico.total_registros = $scope.filtro.terminal.total_registros = 0;
                    $scope.filtro.sintetico.faixa_registros = $scope.filtro.terminal.faixa_registros = '0-0';
                    $scope.filtro.sintetico.total_paginas = $scope.filtro.terminal.total_paginas = 0;
                }
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao obter relatório analítico (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
}]);