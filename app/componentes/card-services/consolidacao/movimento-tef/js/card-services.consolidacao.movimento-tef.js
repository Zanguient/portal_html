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
    $scope.filiais = $scope.bandeiras = [];
                                                 
    $scope.filtro = {datamin : new Date(), datamax : '', filial : null, bandeira : null, busca : '',}
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                           
    
    //Movimentos
    $scope.recebimento = {movimento : [], resumoMovimento : []};
     
    // flag
    var ultimoFiltro = undefined;
    $scope.exibeTela = false;  
    $scope.buscandoRecebimento = false;                                                  
    
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress
    $scope.tab = 2; // init Sintético                                             
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
    $scope.total = {terminal  : {totalTransacoes : 0, valorBruto : 0, 
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    sintetico : {totalTransacoes : 0, valorBruto : 0,
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0}, 
                    analitico : {valorBruto : 0, valorBrutoFiltrado : 0}};                                              
                                            
    
                                                 
    // Inicialização do controller
    $scope.cardServices_consolidacao_movimento_tefInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Consolidação - movimento TEF';
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
                    $scope.filtro.filial = null;
                    buscaFiliais();
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = [];
                    $scope.bandeiras = [];
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
        $scope.buscaMovimento();
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
        
        $scope.filtro.filial = $scope.filtro.bandeira =  null; 

        /*if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }*/
        // Limpa relatórios
        //$scope.movimento_tef.movimento = [];
        $scope.movimento_tef.resumo_movimeto = [];        
        $scope.filtro.movimento.pagina = $scope.filtro.resumo_movimento.pagina = 1;
        $scope.filtro.movimento.total_registros = $scope.filtro.resumo_movimento.total_registros = 0;
        $scope.filtro.movimento.faixa_registros = $scope.filtro.resumo_movimento.faixa_registros = '0-0';
        $scope.filtro.movimento.total_paginas = $scope.filtro.resumo_movimento.total_paginas = 0;
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
        buscaBandeiras(false);
    };
    
    
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, buscarTerminaisLogicos, idBandeira, idTerminalLogico){
       
       if(!$scope.filtro.filial || $scope.filtro.filial === null){
           $scope.filtro.bandeira = null;
           $scope.bandeiras = [];
           return;
       }    
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = undefined;

       // Filtro de adquirente
       if($scope.filtro.filial !== null) filtros = {id: /*$campos.pos.bandeirapos.idOperadora*/ 114, 
                                                        valor: $scope.filtro.filial.id};
       
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
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       var totalPaginas = $scope.tabIs(1) ? $scope.filtro.movimento.total_paginas : 
                          $scope.tabIs(2) ? $scope.filtro.resumo_movimento.total_paginas : 0;
       if(pagina >= 1 && pagina <= totalPaginas){ 
           if($scope.tabIs(1)){ 
               $scope.filtro.terminal.pagina = pagina;
               if($scope.relatorio.terminal.length > 0) buscaRelatorioTerminal(false);
           }else if($scope.tabIs(1)){ 
               $scope.filtro.sintetico.pagina = pagina;
               if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(false);
           }
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        var pagina = $scope.tabIs(1) ? $scope.filtro.terminal.pagina :
                     $scope.tabIs(2) ? $scope.filtro.analitico.pagina : 0;
        setPagina(pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        var pagina = $scope.tabIs(1) ? $scope.filtro.terminal.pagina :
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
        $scope.paginaInformada = $scope.tabIs(1) ? $scope.filtro.terminal.pagina : 
                                 $scope.tabIs(2) ? $scope.filtro.analitico.pagina : 1; 
    };
     
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        alteraFiltroDeBusca();
    };                                             
    
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
        
        
       // Bandeira
       if($scope.filtro.bandeira !== null){
           var filtroBandeira = {id: /*$campos.pos.recebimento.idBandeira*/ 101, 
                                 valor: $scope.filtro.bandeira.id};
           filtros.push(filtroBandeira);
       }
       
       // Retorna    
       return filtros;
    }; 
    
    var alteraFiltroDeBusca = function(){
        if($scope.usuariologado.grupoempresa){
            if($scope.tabIs(1)){
                if($scope.relatorio.terminal.length > 0) buscaRelatorioTerminal(true);
            }else if($scope.tabIs(2)){
                if($scope.relatorio.sintetico.length > 0) buscaRelatorioSintetico(true);
            }
        }    
    };
    
    /**
      * Obtem o Resumo
      */
    $scope.buscaMovimento = function(){
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
        //else if($scope.tabIs(1)) buscaRecebimentoMovimento(true);
        else if($scope.tabIs(2)) buscaRecebimentoResumoMovimento();
    };
 
    // RESUMO DO MOVIMENTO
    /**
      * Busca o resumo do movimento
      */
    var buscaRelatorioTerminal = function(resetaOutrosRelatorios){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.card.tbrecebimentotef, 
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