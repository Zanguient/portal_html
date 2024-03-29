/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.1 - 23/02/2016
 *  - Filtro de NSU => Permite desconsiderar período
 *
 *  Versão 1.0 - 19/11/2015
 *
 */

// App
angular.module("card-services-movimento-tef", []) 

.controller("card-services-movimento-tefCtrl", ['$scope',
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
    $scope.filiais = [];   
    $scope.pdvs = [];                                             
    $scope.filtro = {datamin : new Date(), datamax : '', filial : null, pdv : null,
					 itens_pagina : $scope.itens_pagina[0], order : 0, consideraPeriodo : true,
                     analitico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                     sintetico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
                    };
    $scope.relatorio = {sintetico : [], analitico : []};     
    // Totais
    $scope.total = {sintetico : {valorVendaExibido : 0, valorVendaFiltrado : 0,
                                 totalTransacoesExibido : 0, totalTransacoesFiltrado : 0}, 
                    analitico : {valorVendaExibido : 0, valorVendaFiltrado : 0}};                                              

    // flag
    $scope.tab = 1; // init Analítico                                             
    var ultimoFiltro = undefined;                                          
    $scope.exibeTela = false;  
    $scope.buscandoRecebimento = false;       
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;  
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRecebimentoPos = 1; // posição da div que vai receber o loading progress
                                                
    // Inicialização do controller
    $scope.cardServices_movimento_tefInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Movimento TEF';
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
                    $scope.filtro.filial = $scope.filtro.pdv = $scope.filtro.nsu = $scope.filtro.valor = null;
                    buscaFiliais(true);
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.pdvs = [];
                    $scope.filtro.filial = $scope.filtro.pdv = $scope.filtro.nsu = $scope.filtro.valor = null;
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            if($scope.usuariologado.grupoempresa) buscaFiliais(true);
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Carrega filiais
        //$scope.exibeTela = true;
        //if($scope.usuariologado.grupoempresa) buscaFiliais(true);
    }; 
                                                 
                                                 
                                                 
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       var totalPaginas = $scope.tabIs(0) ? $scope.filtro.sintetico.total_paginas : 
                          $scope.tabIs(1) ? $scope.filtro.analitico.total_paginas : 0;
       if(pagina >= 1 && pagina <= totalPaginas){ 
           if($scope.tabIs(2)){ 
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
        var pagina = $scope.tabIs(2) ? $scope.filtro.sintetico.pagina : 
                     $scope.tabIs(1) ? $scope.filtro.analitico.pagina : 0;
        setPagina(pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        var pagina = $scope.tabIs(2) ? $scope.filtro.sintetico.pagina : 
                     $scope.tabIs(1) ? $scope.filtro.analitico.pagina : 0;
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
        $scope.paginaInformada = $scope.tabIs(2) ? $scope.filtro.sintetico.pagina : 
                                 $scope.tabIs(1) ? $scope.filtro.analitico.pagina : 1; 
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
        
            $scope.filtro.consideraPeriodo = true;

			$scope.filtro.filial = null;
			$scope.filtro.nsu = null;
			$scope.filtro.valor = null;


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
                                                 
                                                 
    // TABS
    /**
      * Seta a tab
      */
    $scope.setTab = function(tab){
        if(typeof tab === 'number' && tab >= 1 && tab <= 2){ 
            $scope.tab = tab;
            if($scope.tabIs(2)){
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
                                                 
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(buscarPDVS, nu_cnpj){
        
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
                if(buscarPDVS) buscaPDVs(true);
                // Fecha o progress
                else $scope.hideProgress(divPortletBodyFiltrosPos);
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
        buscaPDVs();
    };
         
                                                 
                                                 
    // PDVS
    /**
      * Busca os pdvs
      */
    var buscaPDVs = function(progressoemexecucao){
        
       if(!progressoemexecucao) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       if($scope.filtro.filial && $scope.filtro.filial !== null)    
           // Somente os pdvs da filial
           filtros.push({id: /*$campos.cartao.pdvs.CNPJjFilial*/ 101, 
                         valor: $scope.filtro.filial.nu_cnpj});

       
       $webapi.get($apis.getUrl($apis.cartao.pdvs, 
                                [$scope.token, 2, /*$campos.cartao.pdvs.CodPdvHostPagamento*/ 105],
                                filtros)) 
            .then(function(dados){
                $scope.pdvs = dados.Registros;
                // Reseta
                $scope.filtro.pdv = null;
                // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter pdvs (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou um pdv
      */
    $scope.alterouPDV = function(){
        //console.log($scope.filtro.pdv);
    };                                             
                                                 
                                                 
                                                 
                                                 
    
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = [];
       // Data
       var filtroData = {id: /*$campos.card.tbrecebimentotef.dtaVenda*/ 109,
                         valor: $scope.getFiltroData($scope.filtro.datamin)}; 
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       //filtros.push(filtroData);
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: /*$campos.card.tbrecebimentotef.nrCNPJ*/ 102, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // PDV
       if($scope.filtro.pdv && $scope.filtro.pdv !== null){
           var filtroPDV = {id: /*$campos.card.tbrecebimentotef.nrPDVTEF*/ 104, 
                            valor: $scope.filtro.pdv.CodPdvHostPagamento};
           filtros.push(filtroPDV);  
       } 
			
        //NSU
        if($scope.filtro.nsu !== null && $scope.filtro.nsu /* !== undefined && $scope.filtro.nsu !== ""*/){
            var filtroNSU = {id: /*$campos.card.tbrecebimentotef.nrNSUHost*/ 105,
                             valor: $scope.filtro.nsu + '%'};
            filtros.push(filtroNSU);
            
            // Considera período?
            if($scope.filtro.consideraPeriodo !== false)
                filtros.push(filtroData);
        }
        else
            // Sem nsu => considera filtro de data
            filtros.push(filtroData);

        //VALOR
        if($scope.filtro.valor !== null && $scope.filtro.valor !== "0,00" && $scope.filtro.valor !== undefined && 
             $scope.filtro.valor !== ""){
            var filtroValor = {id: /*$campos.card.tbrecebimentotef.vlVenda*/ 111,
                               valor: $scope.filtro.valor};
            filtros.push(filtroValor);
        }
        
       // Retorna    
       return filtros;
    };
    
    var alteraFiltroDeBusca = function(){
        if($scope.usuariologado.grupoempresa){
            if($scope.tabIs(1)){
                if($scope.relatorio.analitico.length > 0) buscaRelatorioAnalitico(true);
            }
        }    
    };											 
	 
	
	$scope.buscaRecebimentoTEF = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
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
        if($scope.tabIs(1)) buscaRelatorioAnalitico(true);
        else if($scope.tabIs(2)) buscaRelatorioSintetico(true);
    };
	
	// ANALÍTICO 
    /**
      * Busca o relatório analítico
      */
    var buscaRelatorioAnalitico = function(resetaRelatorioSintetico, progressoemexecucao){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRecebimentoPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $scope.buscandoMovimento = true;    
        
       $webapi.get($apis.getUrl($apis.card.tbrecebimentotef, 
                                [$scope.token, 4, 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.analitico.pagina],
                                filtros)) 
            .then(function(dados){
           
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.analitico.valorVendaFiltrado = 0;
                $scope.total.analitico.valorVendaExibido = 0;
                // Obtém os dados
                $scope.relatorio.analitico = dados.Registros;
                // Obtém os totais
                $scope.total.analitico.valorVendaFiltrado = dados.Totais.valorVenda;
           
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
                $scope.buscandoMovimento = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRecebimentoPos);
              },
              function(failData){
                 // Reseta tudo
                 $scope.relatorio.analitico = [];
                 $scope.filtro.analitico.pagina = 1;
                 $scope.filtro.analitico.total_registros = 0;
                 $scope.filtro.analitico.faixa_registros = '0-0';
                 $scope.filtro.analitico.total_paginas = 0;
           
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório analítico (' + failData.status + ')', true, 'danger', true);
           
                 $scope.buscandoMovimento = false;
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRecebimentoPos);
              });       
    }											 

     
    
    
    
    // SINTÉTICO
    var buscaRelatorioSintetico = function(resetaRelatorioAnalitico, progressoemexecucao){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRecebimentoPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $scope.buscandoMovimento = true;    
        
       $webapi.get($apis.getUrl($apis.card.tbrecebimentotef, 
                                [$scope.token, 3, 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.sintetico.pagina],
                                filtros)) 
            .then(function(dados){
           
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.sintetico.valorVendaFiltrado = 0;
                $scope.total.sintetico.valorVendaExibido = 0;
                $scope.total.sintetico.totalTransacoesExibido = 0;
                $scope.total.sintetico.totalTransacoesFiltrado = 0;
                // Obtém os dados
                $scope.relatorio.sintetico = dados.Registros;
                // Obtém os totais
                $scope.total.sintetico.valorVendaFiltrado = dados.Totais.valorVenda;
                $scope.total.sintetico.totalTransacoesFiltrado = dados.Totais.totalTransacoes;
           
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
                if(resetaRelatorioAnalitico){
                    $scope.relatorio.analitico = [];
                    $scope.filtro.analitico.pagina = 1;
                    $scope.filtro.analitico.total_registros = 0;
                    $scope.filtro.analitico.faixa_registros = '0-0';
                    $scope.filtro.analitico.total_paginas = 0;
                }
           
                // Fecha os progress
                $scope.buscandoMovimento = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRecebimentoPos);
              },
              function(failData){
                 // Reseta tudo
                 $scope.relatorio.sintetico = [];
                 $scope.filtro.sintetico.pagina = 1;
                 $scope.filtro.sintetico.total_registros = 0;
                 $scope.filtro.sintetico.faixa_registros = '0-0';
                 $scope.filtro.sintetico.total_paginas = 0;
           
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório sintético (' + failData.status + ')', true, 'danger', true);
           
                 $scope.buscandoMovimento = false;
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRecebimentoPos);
              });       
    }
     
}]);