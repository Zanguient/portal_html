/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.8 - 18/12/2015
 *  - Correção na requisição de exportar para CSV (cópia por valor do ultimoFiltro)
 *
 *  Versão 1.0.7 - 16/11/2015
 *  - Remoção de cargas, vendas e ajustes
 *
 *  Versão 1.0.6 - 16/10/2015
 *  - Combo ADQUIRENTE sendo preenchida pela tabela tbAdquirente em vez de Operadora
 *  - Combo BANDEIRA sendo preenchida pela tabela tbBandeira em vez de BandeiraPos
 *  - Taxa CashFlow calculada considerando apenas os recebimentos
 *
 *  Versão 1.0.5 - 28/09/2015
 *  - Valor Desconto por Antecipação
 *
 *  Versão 1.0.4 - 22/09/2015
 *  - Ajuste da exportação: não aciona o ws
 *
 *  Versão 1.0.3 - 22/09/2015
 *  - Exportar para CSV
 *
 *  Versão 1.0.2 - 21/09/2015
 *  - Correção da seleção do filtro de bandeira
 *
 *  Versão 1.0.1 - 18/09/2015
 *  - Busca somente filiais ativas
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("card-services-cash-flow-relatorios", []) 

.controller("card-services-cash-flow-relatoriosCtrl", ['$scope',
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
    $scope.adquirentes = [];
    $scope.bandeiras = [];   
    $scope.camposBusca = [
                          {
                            id: 603, //$campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.nsu - 100,
                            nome: "NSU"
                          },{
                            id: 613, //$campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.codResumoVenda - 100, 
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
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                           
                                                 
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress
    $scope.tab = 0; // init Sintético
    
    // Relatórios
    $scope.relatorio = {sintetico : [], analitico : []};                                             
    // Totais
    $scope.total = {sintetico : {totalTransacoes : 0, valorBruto : 0, valorParcela : 0, 
                                 valorLiquido : 0, valorDescontado : 0, vlDescontadoAntecipacao : 0,
                                 totalTransacoesFiltrado : 0, valorBrutoFiltrado : 0, valorParcelaFiltrado : 0, 
                                 valorLiquidoFiltrado : 0, valorDescontadoFiltrado : 0, 
                                 valorDescontadoFiltrado : 0, vlDescontadoAntecipacaoFiltrado : 0}, 
                    analitico : {valorBruto : 0, valorParcela : 0, valorLiquido : 0, 
                                 valorDescontado : 0, vlDescontadoAntecipacao : 0, taxaCashFlow : 0, totalCashFlow : 0,
                                 valorBrutoFiltrado : 0, valorParcelaFiltrado : 0, 
                                 valorLiquidoFiltrado : 0, valorDescontadoFiltrado : 0, 
                                 vlDescontadoAntecipacaoFiltrado : 0, taxaCashFlowFiltrado : 0}};                         
    // flag
    var ultimoFiltro = undefined;
    $scope.exibeTela = false;  
    $scope.buscandoRelatorio = false; 
    var permissaoRemocao = false;                                             
                                            
                                                 
                                                 
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
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            //permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;  
            //permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
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
                                                 
    
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode remover cargas
      */
    $scope.usuarioPodeRemoverCargas = function(){
        return permissaoRemocao;    
    }                                                
                                                 
    
                                                 
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
        else $scope.atualizaPaginaDigitada();  
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
       var filtros = [];
       // Data
       var filtroData;
        
       if($scope.filtro.data === 'Venda') filtroData = {//id: $campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.dtaVenda - 100,
                          id: 605,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};  
       else filtroData = {id: /*$campos.pos.recebimentoparcela.dtaRecebimentoEfetivo*/ 107 ,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};
           
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros.push(filtroData);
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: 300,//$campos.pos.recebimentoparcela.empresa + $campos.cliente.empresa.nu_cnpj - 100, 
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.adquirente !== null){
           var filtroAdquirente = {id: 700,//$campos.pos.recebimentoparcela.operadora + $campos.card.tbadquirente.cdAdquirente - 100, 
                                   valor: $scope.filtro.adquirente.cdAdquirente};
           filtros.push(filtroAdquirente);
       } 
        
       // Bandeira
       if($scope.filtro.bandeira !== null){
           var filtroBandeira = {id: 800,//$campos.pos.recebimentoparcela.bandeira + $campos.card.tbbandeira.cdBandeira - 100, 
                                 valor: $scope.filtro.bandeira.cdBandeira};
           filtros.push(filtroBandeira);
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
        if($scope.tabIs(0)) buscaRelatorioSintetico(true);
        else if($scope.tabIs(1)) buscaRelatorioAnalitico(true);
    };
                                                 
    
    // SINTÉTICO 
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioSintetico = function(resetaRelatorioAnalitico){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
           
       $scope.buscandoRelatorio = true;    
        
       $webapi.get($apis.getUrl($apis.pos.recebimentoparcela, 
                                [$scope.token, 9, 
                                 //$campos.pos.recebimentoparcela.empresa + $campos.cliente.empresa.ds_fantasia - 100, 
                                 304, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.sintetico.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.sintetico.totalTransacoes = $scope.total.sintetico.valorBruto = $scope.total.sintetico.valorParcela = $scope.total.sintetico.valorLiquido = $scope.total.sintetico.valorDescontado = $scope.total.sintetico.vlDescontadoAntecipacao = 0;
                // Obtém os dados
                $scope.relatorio.sintetico = dados.Registros;
                // Obtém os totais
                $scope.total.sintetico.totalTransacoesFiltrado = dados.Totais.totalTransacoes;
                $scope.total.sintetico.valorBrutoFiltrado = dados.Totais.valorBruto;
                $scope.total.sintetico.valorDescontadoFiltrado = dados.Totais.valorDescontado;
                $scope.total.sintetico.vlDescontadoAntecipacaoFiltrado = dados.Totais.vlDescontadoAntecipacao;
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
                $scope.buscandoRelatorio = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 // Reseta info
                 $scope.relatorio.sintetico = [];
                 $scope.filtro.sintetico.pagina = 1;
                 $scope.filtro.sintetico.total_registros = 0;
                 $scope.filtro.sintetico.faixa_registros = '0-0';
                 $scope.filtro.sintetico.total_paginas = 0;
           
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório sintético (' + failData.status + ')', true, 'danger', true);
           
                 $scope.buscandoRelatorio = false;
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
    
    // ANALÍTICO
    
     $scope.detalhar = function(relsintetico){
         // Tinha filial selecionada e ela era a que está para ser detalhada?
         if(!$scope.filtro.filial || $scope.filtro.filial === null || 
            $scope.filtro.filial.nu_cnpj !== relsintetico.empresa.nu_cnpj){
             // Filial diferente!
             $scope.filtro.filial = $filter('filter')($scope.filiais, function(f){return f.nu_cnpj === relsintetico.empresa.nu_cnpj;})[0]; 
             buscaAdquirentes(false, relsintetico.bandeira.cdAdquirente, relsintetico.bandeira.cdBandeira);
             $scope.filtro.adquirente = {cdAdquirente : relsintetico.bandeira.cdAdquirente};
             $scope.filtro.bandeira = relsintetico.bandeira;
             
             // vai para Analítico
             $scope.setTab(1); 
             buscaRelatorioAnalitico(true);
         }else{
             // Mesma filial => Procura a adquirente
             var adquirente = $filter('filter')($scope.adquirentes, function(a){return a.cdAdquirente === relsintetico.bandeira.cdAdquirente;})[0];
             if(adquirente){ 
                 // Verifica se a adquirente já não estava selecionada
                 if(adquirente !== $scope.filtro.adquirente){
                     $scope.filtro.adquirente = adquirente;
                     // Seta os models para refazer a busca por adquirente
                     $scope.filtro.bandeira = relsintetico.bandeira;
                     // Set o flag
                     adquirente = null;
                }else
                    // Apenas busca a bandeira
                    $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.cdBandeira === relsintetico.bandeira.cdBandeira;})[0];
                
                // vai para Analítico
                $scope.setTab(1); 
                 
                // Faz a busca analítica
                if(typeof ultimoFiltro === 'undefined' || !$scope.arraysAreEqual(ultimoFiltro, obtemFiltroDeBusca())) 
                    buscaRelatorioAnalitico(true);
                // Carrega o conjunto de bandeiras associadas à nova adquirente selecionada
                if(adquirente === null) $timeout(function(){$scope.alterouAdquirente(relsintetico.bandeira.cdBandeira, true)}, 500);
             }else $scope.filtro.adquirente = null;
         }
    };
    
    /**
      * Busca o relatório agrupado por bandeira
      */
    var buscaRelatorioAnalitico = function(resetaRelatorioSintetico, progressoemexecucao){
        
        if(!progressoemexecucao){
           $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
           $scope.showProgress(divPortletBodyRelatorioPos);
        }
        
       // Filtros    
       var filtros = obtemFiltroDeBusca();
    
       var order = $scope.filtro.data === 'Recebimento' ? /*$campos.pos.recebimentoparcela.dtaRecebimento*/ 104  :
                   605;//$campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.dtaVenda - 100;    
    
       $scope.buscandoRelatorio = true;
        
       $webapi.get($apis.getUrl($apis.pos.recebimentoparcela, 
                                [$scope.token, 8, order, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.analitico.pagina],
                                filtros)) 
            .then(function(dados){
                ultimoFiltro = filtros;
           
                // Reseta os valores totais
                $scope.total.analitico.valorBruto = $scope.total.analitico.valorParcela = $scope.total.analitico.valorLiquido = $scope.total.analitico.valorDescontado = $scope.total.analitico.vlDescontadoAntecipacao = $scope.total.analitico.totalCashFlow = $scope.total.analitico.taxaCashFlow = 0;
                // Obtém os dados
                $scope.relatorio.analitico = dados.Registros;
                // Obtém os totais
                $scope.total.analitico.valorParcelaFiltrado = dados.Totais.valorParcelaBruta;
                $scope.total.analitico.valorBrutoFiltrado = dados.Totais.valorBruto;
                $scope.total.analitico.valorDescontadoFiltrado = dados.Totais.valorDescontado;
                $scope.total.analitico.vlDescontadoAntecipacaoFiltrado = dados.Totais.vlDescontadoAntecipacao;
                $scope.total.analitico.valorLiquidoFiltrado = dados.Totais.valorParcelaLiquida;
                $scope.total.analitico.taxaCashFlowFiltrado = dados.Totais.taxaCashFlow;
           
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
                $scope.buscandoRelatorio = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
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
                 $scope.buscandoRelatorio = false;  
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });       
    }
    
    
    $scope.addTaxaCashFlow = function(ehAjuste, taxa){
        if(ehAjuste) return;
        $scope.total.analitico.totalCashFlow++;
        $scope.total.analitico.taxaCashFlow += taxa;
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
        
        var filtros = []; //obtemFiltroDeBusca();
        // Obtém ultimo filtro
        angular.copy(ultimoFiltro, filtros);
        
        // Exportar
        filtros.push({id: /*$campos.pos.recebimentoparcela.exportar*/ 9999,
                      valor : true});
    
        var url = '';
        var filename = '';
        
        if($scope.tabIs(0)){
            // Sintético
            url = $apis.getUrl($apis.pos.recebimentoparcela, 
                                [$scope.token, 9, 
                                 //$campos.pos.recebimentoparcela.empresa + $campos.cliente.empresa.ds_fantasia - 100, 
                                 304, 0],
                                filtros);
            filename = 'Cash-Flow-Relatorio-Sintetico.csv';
        }else if($scope.tabIs(1)){ 
            // Analítico
            var order = $scope.filtro.data === 'Recebimento' ? /*$campos.pos.recebimentoparcela.dtaRecebimento*/ 104  :
                        605;//$campos.pos.recebimentoparcela.recebimento + $campos.pos.recebimento.dtaVenda - 100; 
        
            url = $apis.getUrl($apis.pos.recebimentoparcela, [$scope.token, 8, order, 0], filtros);
            filename = 'Cash-Flow-Relatorio-Analitico.csv';
        }else 
            return;
        
        // Seta para a url de download
        if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
            url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
        
        $scope.buscandoRelatorio = true;
        var funcao = function(){ $scope.buscandoRelatorio = false; };
        
        $scope.download(url, filename, true, divPortletBodyRelatorioPos, divPortletBodyFiltrosPos, funcao, funcao);        
    }
    
    
    
    
    
    
    
    
    // REMOVE CARGA
    $scope.removeCarga = function(relanalitico){
        if(!relanalitico || relanalitico === null ||
          ((!relanalitico.parcela || relanalitico.parcela === null) && 
           (!relanalitico.ajuste || relanalitico.ajuste === null)))
           return;
        
        if(relanalitico.ajuste && relanalitico.ajuste !== null){
            // É um ajuste
            $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir o ajuste?',
                                     excluiAjuste, relanalitico.ajuste.idRecebimentoAjuste, 
                                    'Sim', 'Não'); 
        }else{
            // É uma parcela
            // Remover a venda ou a parcela?
            $scope.showModalConfirmacao('Confirmação', 
                                    'Excluir venda completa ou somente a parcela?',
                                     excluirVenda, relanalitico.parcela.idRecebimento, 
                                    'Venda', 'Cancelar', true, 'Parcela', 
                                     excluirParcela, relanalitico.parcela); 
        }
  
    }
    
    
    var excluirVenda = function(idRecebimento){
        //console.log("EXCLUIR VENDA " + idRecebimento);
        $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
        $scope.showProgress(divPortletBodyRelatorioPos);
        
        // Exclui
        $webapi.delete($apis.getUrl($apis.pos.recebimento, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'id', valor: idRecebimento}]))
                .then(function(dados){           
                    $scope.showAlert('Venda excluída com sucesso!', true, 'success', true);
                    // Relista
                    buscaRelatorioAnalitico(false, true);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Venda não pode ser excluída!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir a venda (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);   
                     $scope.hideProgress(divPortletBodyRelatorioPos);
                  });  
    }
    
    var excluirParcela = function(parcela){
        //console.log("EXCLUIR PARCELA " + parcela.numParcela + " DA VENDA " + parcela.idRecebimento);
        $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
        $scope.showProgress(divPortletBodyRelatorioPos);
        
        // Exclui
        $webapi.delete($apis.getUrl($apis.pos.recebimentoparcela, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'idRecebimento', valor: parcela.idRecebimento},
                                      {id: 'numParcela', valor: parcela.numParcela}]))
                .then(function(dados){           
                    $scope.showAlert('Parcela excluída com sucesso!', true, 'success', true);
                    // Relista
                    buscaRelatorioAnalitico(false, true);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Parcela não pode ser excluída!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir a parcela (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);   
                     $scope.hideProgress(divPortletBodyRelatorioPos);
                  });
    }
    
    var excluiAjuste = function(idRecebimentoAjuste){
        //console.log("EXCLUIR AJUSTE " + idRecebimentoAjuste);
        $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen    
        $scope.showProgress(divPortletBodyRelatorioPos);
        
        // Exclui
        $webapi.delete($apis.getUrl($apis.card.tbrecebimentoajuste, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'idRecebimentoAjuste', valor: idRecebimentoAjuste}]))
                .then(function(dados){           
                    $scope.showAlert('Ajuste excluído com sucesso!', true, 'success', true);
                    // Relista
                    buscaRelatorioAnalitico(false, true);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Ajuste não pode ser excluído!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir o ajuste (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);   
                     $scope.hideProgress(divPortletBodyRelatorioPos);
                  });
    }
    
}]);