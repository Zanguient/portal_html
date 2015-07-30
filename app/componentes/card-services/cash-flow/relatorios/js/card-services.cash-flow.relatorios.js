/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("card-services-cash-flow-relatorios", []) 

.controller("card-services-cash-flow-relatoriosCtrl", ['$scope',
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
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.filiais = [];  
    $scope.adquirentes = [];
    $scope.bandeiras = [];   
    $scope.camposBusca = [
                          {
                            id: $campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.nsu - 100,
                            nome: "NSU"
                          },{
                            id: $campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.codResumoVenda - 100, 
                            nome: "Resumo Vendas"
                          },
                         ];                                             
    $scope.filtro = {datamin : new Date(), datamax : '', data : 'Recebimento',
                     filial : null, adquirente : null, bandeira : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     busca : '', campo_busca : $scope.camposBusca[0],
                     sintetico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                     analitico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                    };
    $scope.abrirCalendarioDataMin = $scope.abrirCalendarioDataVendaMin = false;
    $scope.abrirCalendarioDataMax = $scope.abrirCalendarioDataVendaMax = false;                                           
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress
    $scope.tab = 0; // init Sintético
    
    // Relatórios
    $scope.relatorio = {sintetico : [], analitico : []};                                             
    // Totais
    $scope.total = {sintetico : {totalTransacoes : 0, valorBruto : 0, valorParcela : 0, 
                                 valorLiquido : 0, valorDescontado : 0,
                                totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0, valorParcelaFiltrado : 0, 
                                 valorLiquidoFiltrado : 0, valorDescontadoFiltrado : 0}, 
                    analitico : {valorBruto : 0, valorParcela : 0, valorLiquido : 0, valorDescontado : 0,
                                 valorBrutoFiltrado : 0, valorParcelaFiltrado : 0, 
                                 valorLiquidoFiltrado : 0, valorDescontadoFiltrado : 0}};                         
    // flag
    var ultimoFiltro = undefined;                     
                                            
                                                 
                                                 
    // Inicialização do controller
    $scope.cardServices_cashFlow_relatoriosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Cash Flow - Relatórios';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Avalia grupo empresa
            if($scope.grupoempresa){ 
                // Reseta seleção de filtro específico de empresa
                $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = null;
                buscaFiliais(true);
            }else{ // reseta tudo e não faz buscas 
                $scope.filiais = []; 
                $scope.adquirentes = [];
                $scope.bandeiras = [];
            }
        }); 
        // Carrega filiais
        if($scope.grupoempresa) buscaFiliais(true);
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
        
        $scope.filtro.adquirente = $scope.filtro.bandeira = null; 

        if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }
        // Limpa relatórios
        $scope.relatorio.analitico = [];
        $scope.relatorio.sintetico = [];
        $scope.filtro.analitico.pagina = $scope.filtro.sintetico.pagina = 1;
        $scope.filtro.analitico.total_registros = $scope.filtro.sintetico.total_registros = 0;
        $scope.filtro.analitico.faixa_registros = $scope.filtro.sintetico.faixa_registros = '0-0';
        $scope.filtro.analitico.total_paginas = $scope.filtro.sintetico.total_paginas = 0;
    }
    
    // DATA RECEBIMENTO
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
    var buscaFiliais = function(){
        
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
                $scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                // Busca adquirentes
                buscaAdquirentes(true);
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
        buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto){
 
       if($scope.filtro.filial === null){
           $scope.filtro.adquirente = $scope.filtro.bandeira = null;
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.filtro.filial !== null) filtros = {id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                                                    valor: $scope.filtro.filial.nu_cnpj};
       
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
    $scope.alterouAdquirente = function(idBandeira, progressEstaAberto){
        $scope.bandeiras = []; 
        $scope.filtro.bandeira = null;
        if($scope.filtro.adquirente !== null) buscaBandeiras(progressEstaAberto, idBandeira);
    };
                
                                                 
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, idBandeira){
       
       if($scope.filtro.adquirente === null){
           $scope.filtro.bandeira = null;
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos);    
        
       var filtros = undefined;

       // Filtro de adquirente
       if($scope.filtro.adquirente !== null) filtros = {id: $campos.pos.bandeirapos.idOperadora, 
                                                        valor: $scope.filtro.adquirente.id};
       
       $webapi.get($apis.getUrl($apis.pos.bandeirapos, 
                                [$scope.token, 0, $campos.pos.bandeirapos.desBandeira],
                                filtros)) 
            .then(function(dados){
                $scope.bandeiras = dados.Registros;
                // Reseta ou seta para um objeto
                if(typeof idBandeira === 'number' && idBandeira > 0){ 
                    $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.id === idBandeira;})[0];
                    if(!$scope.filtro.bandeira) $scope.filtro.bandeira = null;
                }else $scope.filtro.bandeira = null;
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
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
                                                 
                                                 
                                                 

    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       var totalPaginas = $scope.tabIs(0) ? $scope.filtro.sintetico.total_paginas : 
                          $scope.tabIs(1) ? $scope.filtro.analitico.total_paginas : 0;
       if(pagina >= 1 && pagina <= totalPaginas){ 
           if($scope.tabIs(0)){ 
               $scope.filtro.sintetico.pagina = pagina;
               if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(false);
           }else if($scope.tabIs(1)){ 
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
        var pagina = $scope.tabIs(0) ? $scope.filtro.sintetico.pagina : 
                     $scope.tabIs(1) ? $scope.filtro.analitico.pagina : 0;
        setPagina(pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        var pagina = $scope.tabIs(0) ? $scope.filtro.sintetico.pagina : 
                     $scope.tabIs(1) ? $scope.filtro.analitico.pagina : 0;
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
        $scope.paginaInformada = $scope.tabIs(0) ? $scope.filtro.sintetico.pagina : 
                                 $scope.tabIs(1) ? $scope.filtro.analitico.pagina : 1; 
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
                $scope.paginaInformada = $scope.filtro.sintetico.pagina;
                if($scope.relatorio.sintetico.length == 0 && 
                   $scope.relatorio.analitico.length > 0) 
                        buscaRelatorioSintetico(false);   
            }else if($scope.tabIs(1)){
                $scope.paginaInformada = $scope.filtro.analitico.pagina;
                if($scope.relatorio.analitico.length == 0 && 
                   $scope.relatorio.sintetico.length > 0) 
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
       var filtroData;
        
       if($scope.filtro.data === 'Venda') filtroData = {id: $campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.dtaVenda - 100,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};  
       else filtroData = {id: $campos.pos.recebimentoparcela.dtaRecebimento,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};
           
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros = [filtroData];
        
       // Filial
       if($scope.filtro.filial !== null){
           var filtroFilial = {id: $campos.pos.recebimentoparcela.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: $campos.pos.recebimentoparcela.operadora + $campos.pos.operadora.id - 100, 
                                   valor: $scope.filtro.adquirente.id};
           filtros.push(filtroAdquirente);
       } 
        
       // Bandeira
       if($scope.filtro.bandeira !== null){
           var filtroBandeira = {id: $campos.pos.recebimentoparcela.bandeira + $campos.pos.bandeirapos.id - 100, 
                                 valor: $scope.filtro.bandeira.id};
           filtros.push(filtroBandeira);
       }
        
       // Verifica se tem algum valor para ser filtrado (NSU ou Cod. Autorizador)   
       if($scope.filtro.busca.length > 0) 
           filtros.push({id: $scope.filtro.campo_busca.id, valor: $scope.filtro.busca + '%'});     
       
       // Retorna    
       return filtros;
    };
    
    var alteraFiltroDeBusca = function(){
        if($scope.grupoempresa){
            if($scope.tabIs(0)){
                if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(true);
            }else if($scope.tabIs(1)){
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
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
        }
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
        if($scope.tabIs(0)) buscaRelatorioSintetico(true);
        else if($scope.tabIs(1)) buscaRelatorioAnalitico(true);
    };
                                                 
    
    // SINTÉTICO 
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioSintetico = function(resetaRelatorioAnalitico){
       
       if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
       }
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $webapi.get($apis.getUrl($apis.pos.recebimentoparcela, 
                                [$scope.token, 9, 
                                 $campos.pos.recebimentoparcela.bandeira + $campos.pos.bandeirapos.desBandeira - 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.sintetico.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.sintetico.totalTransacoes = $scope.total.sintetico.valorBruto = $scope.total.sintetico.valorParcela = $scope.total.sintetico.valorLiquido = $scope.total.sintetico.valorDescontado = 0;
                // Obtém os dados
                $scope.relatorio.sintetico = dados.Registros;
                // Obtém os totais
                $scope.total.sintetico.totalTransacoesFiltrado = dados.Totais.totalTransacoes;
                $scope.total.sintetico.valorBrutoFiltrado = dados.Totais.valorBruto;
                $scope.total.sintetico.valorDescontadoFiltrado = dados.Totais.valorDescontado;
                $scope.total.sintetico.valorLiquidoFiltrado = dados.Totais.valorLiquida;
                $scope.total.sintetico.valorParcelaFiltrado = dados.Totais.valorParcela;
                
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
                $scope.obtendoUsuarios = false;
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.sintetico.pagina > $scope.filtro.sintetico.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Reseta os outros para forçar uma nova busca
                if(resetaRelatorioAnalitico){
                    $scope.relatorio.analitico = [];
                    $scope.filtro.analitico.pagina = 1;
                    $scope.filtro.analitico.total_registros = 0;
                    $scope.filtro.analitico.faixa_registros = '0-0';
                    $scope.filtro.analitico.total_paginas = 0;
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
    
     $scope.detalhar = function(bandeira){
         // Procura a adquirente
         var adquirente = $filter('filter')($scope.adquirentes, function(a){return a.id === bandeira.idOperadora;})[0];
         if(adquirente){ 
             // vai para Analítico
             $scope.setTab(1);
             // Verifica se a adquirente já não estava selecionada
             if(adquirente !== $scope.filtro.adquirente){
                 $scope.filtro.adquirente = adquirente;
                 // Seta os models para refazer a busca por adquirente
                 $scope.filtro.bandeira = bandeira;
                 // Set o flag
                 adquirente = null;
            }else
                // Apenas busca a bandeira
                $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.id === bandeira.id;})[0];
             
            // Faz a busca analítica
            if(typeof ultimoFiltro === 'undefined' || !$scope.arraysAreEqual(ultimoFiltro, obtemFiltroDeBusca())) 
                buscaRelatorioAnalitico(true);
            // Carrega o conjunto de bandeiras associadas à nova adquirente selecionada
            if(adquirente === null) $timeout(function(){$scope.alterouAdquirente(bandeira.id, true)}, 500);
         }else $scope.filtro.adquirente = null;
         //console.log("DETALHAR");console.log(bandeira);
    };
    
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioAnalitico = function(resetaRelatorioSintetico){
       
       if($scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
       }    
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $webapi.get($apis.getUrl($apis.pos.recebimentoparcela, 
                                [$scope.token, 8, $campos.pos.recebimentoparcela.dtaRecebimento, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.analitico.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.analitico.valorBruto = $scope.total.analitico.valorParcela = $scope.total.analitico.valorLiquido = $scope.total.analitico.valorDescontado = 0;
                // Obtém os dados
                $scope.relatorio.analitico = dados.Registros;
                // Obtém os totais
                $scope.total.analitico.valorParcelaFiltrado = dados.Totais.valorParcelaBruta;
                $scope.total.analitico.valorBrutoFiltrado = dados.Totais.valorBruto;
                $scope.total.analitico.valorDescontadoFiltrado = dados.Totais.valorDescontado;
                $scope.total.analitico.valorLiquidoFiltrado = dados.Totais.valorParcelaLiquida;
           
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
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao obter relatório analítico (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
}]);