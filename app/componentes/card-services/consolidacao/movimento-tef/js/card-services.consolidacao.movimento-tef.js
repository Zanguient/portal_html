/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 22/10/2015
 *
 */

// App
angular.module("card-services-consolidacao-movimento-tef", []) 

.controller("card-services-consolidacao-movimento-tefCtrl", ['$scope',
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
    $scope.filiais = $scope.adquirentes = $scope.bandeiras = [];
                                                 
    $scope.filtro = {datamin : new Date(), datamax : '', filial : null, adquirente : null, bandeira : null, busca : '',}
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                           
    
    //Movimentos
    $scope.recebimento = {movimento : [], resumoMovimento : []};
     
    // flag
    var ultimoFiltro = undefined;
    $scope.adquirenteSelecionada = undefined;                                             
    $scope.exibeTela = false;  
    $scope.buscandoRecebimento = false;                                                  
    
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress
    $scope.tab = 1; // init Sintético                                             
    $scope.movimentos = [{horario: '09:00',	
                          filial: 'Filal 17 - ARUANDA' ,	
                          bandeira: 'VISA' ,	
                          cartao: '863587****3453' ,	
                          valor: '54,08', 
                          parcelas:5 ,
                          tipo:'CRÉDITO' ,	
                          nsuSitef:0000012 , 
                          status: 'EFETUADA',
                         },
                         {horario: '12:30',	
                          filial: 'Filal 03 - HERMES FONTES' ,	
                          bandeira: 'ELO DÉBITO' ,	
                          cartao: '237643****8675' ,	
                          valor: '190,00', 
                          parcelas:1 ,
                          tipo:'DÉBITO' ,	
                          nsuSitef:0000023 , 
                          status: 'NÃO EFETUADA',
                         }
                        ];
    $scope.resumos_movimento = [{bandeira:'cielo',
                                 transacao:67,
                                 quantidade:9,
                                 valor:789,
                                },
                               {bandeira:'Master',
                                 transacao:45,
                                 quantidade:2,
                                 valor:235,
                                }]; 
    
    
    
    // Relatórios
    $scope.relatorio = {terminal : [], sintetico : [], analitico : []};                                             
    // Totais
    $scope.total = {movimento  : {totalTransacoes : 0, valorBruto : 0, 
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    resumos_movimento : {totalTransacoes : 0, valorBruto : 0,
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}};                                              
                                            
    
                                                 
    // Inicialização do controller
    $scope.cardServices_consolidacao_movimento_tefInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Cash Flow - Relatórios';
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
                    $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = null;
                    buscaFiliais(true);
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.adquirentes = [];
                    $scope.bandeiras = [];
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
        
        $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.bandeira = null; 

        /*if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }*/
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
    var buscaFiliais = function(buscarAdquirentes, nu_cnpj, cdAdquirente){
        
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
                //if($scope.filtro.filial && $scope.filtro.filial !== null)
                if(buscarAdquirentes)
                    buscaAdquirentes(true, cdAdquirente); // Busca adquirentes
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
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente, cdBandeira){
 
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1}];
        
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           // Filtro do grupo empresa => barra administrativa
           filtros.push({id: /*$campos.card.tbadquirente.cnpj*/ 305,
                         valor: $scope.filtro.filial.nu_cnpj});
       }     
       
       $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 1, /*$campos.card.tbadquirente.nmAdquirente*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(typeof cdAdquirente === 'number' && cdAdquirente > 0) 
                    $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                else $scope.filtro.adquirente = null;
                // Busca bandeiras
                $scope.filtro.bandeira = null;
                if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) buscaBandeiras(true, cdBandeira);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
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
    $scope.alterouAdquirente = function(cdBandeira, progressEstaAberto){
        $scope.bandeiras = []; 
        $scope.filtro.bandeira = null;
        if($scope.filtro.adquirente !== null) buscaBandeiras(progressEstaAberto, cdBandeira);
    };
                
                                                 
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, cdBandeira){
       
       if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null){
           $scope.filtro.bandeira = null;
           $scope.bandeiras = [];
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = {id: /*$campos.card.tbbandeira.cdAdquirente */ 102, 
                      valor: $scope.filtro.adquirente.cdAdquirente};
       
       $webapi.get($apis.getUrl($apis.card.tbbandeira, 
                                [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.bandeiras = dados.Registros;
                // Reseta ou seta para um objeto
                if(typeof cdBandeira === 'number' && cdBandeira > 0){ 
                    $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.cdBandeira === cdBandeira;})[0];
                    if(!$scope.filtro.bandeira) $scope.filtro.bandeira = null;
                }else $scope.filtro.bandeira = null;
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
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
                                                 
    //TAB 
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 2) $scope.tab = tab;  
    }
     
    //console.log($scope.resumos_movimento);    
    //console.log($scope.movimentos);    
     
}]);